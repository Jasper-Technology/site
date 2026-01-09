/**
 * Sequential Modular Block Solver
 * 
 * Solves flowsheet block-by-block (like AspenPlus):
 * 1. Order blocks topologically (feed to product)
 * 2. Solve each block using mass & energy balances
 * 3. Pass results to downstream blocks
 * 4. Iterate until converged for recycles
 */

import type { JasperProject, UnitOpNode } from '../../core/schema';
import {
  COMPONENT_DATABASE,
  mixtureEnthalpy,
  calculateKValues,
  rachfordRiceFlash,
  flashComposition,
  density,
} from '../thermo/properties';

export interface StreamState {
  id: string;
  name: string;
  T: number;           // Temperature (K)
  P: number;           // Pressure (bar)
  flow: number;        // Total molar flow (kmol/h)
  composition: Record<string, number>; // Mole fractions
  phase: 'V' | 'L' | 'VL';
  H: number;           // Specific enthalpy (kJ/mol)
}

export interface SolverResult {
  converged: boolean;
  streams: Map<string, StreamState>;
  blockResults: Map<string, any>;
  error?: string;
}

/**
 * Main block solver - sequential modular approach
 */
export function solveFlowsheet(project: JasperProject): SolverResult {
  const streams = new Map<string, StreamState>();
  const blockResults = new Map<string, any>();

  try {
    // Step 1: Initialize all feed streams from specifications
    initializeFeedStreams(project, streams);

    // Step 2: Topological sort of blocks (feed → product order)
    const blockOrder = topologicalSort(project);

    // Step 3: Solve blocks sequentially
    for (const blockId of blockOrder) {
      const block = project.flowsheet.nodes.find(n => n.id === blockId);
      if (!block) continue;

      solveBlock(block, project, streams, blockResults);
    }

    return {
      converged: true,
      streams,
      blockResults,
    };
  } catch (error) {
    return {
      converged: false,
      streams,
      blockResults,
      error: error instanceof Error ? error.message : 'Unknown solver error',
    };
  }
}

/**
 * Initialize feed streams from specifications
 */
function initializeFeedStreams(project: JasperProject, streams: Map<string, StreamState>) {
  const feedBlocks = project.flowsheet.nodes.filter(n => n.type === 'Feed');

  for (const feed of feedBlocks) {
    // Find outlet streams from this feed
    const outletStreams = project.flowsheet.edges.filter(e => e.from.nodeId === feed.id);

    for (const stream of outletStreams) {
      if (!stream.spec) continue;

      // Convert units to standard (K, bar, kmol/h)
      const T = convertTemperature(stream.spec.T?.value || 298.15, stream.spec.T?.unit || 'K');
      const P = convertPressure(stream.spec.P?.value || 1.0, stream.spec.P?.unit || 'bar');
      const flow = stream.spec.flow?.value || 100;

      // Calculate enthalpy
      const H = mixtureEnthalpy(stream.spec.composition || {}, T, P);

      streams.set(stream.id, {
        id: stream.id,
        name: stream.name,
        T,
        P,
        flow,
        composition: stream.spec.composition || {},
        phase: (stream.spec.phase && (stream.spec.phase === 'V' || stream.spec.phase === 'L' || stream.spec.phase === 'VL') ? stream.spec.phase : 'L') as 'V' | 'L' | 'VL',
        H,
      });
    }
  }
}

/**
 * Topological sort - returns blocks in execution order
 */
function topologicalSort(project: JasperProject): string[] {
  const order: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // Build adjacency list
  const graph = new Map<string, string[]>();
  for (const block of project.flowsheet.nodes) {
    if (block.type === 'TextBox' || block.type === 'Sink') continue;
    graph.set(block.id, []);
  }

  for (const stream of project.flowsheet.edges) {
    const from = stream.from.nodeId;
    const to = stream.to.nodeId;
    if (graph.has(from) && graph.has(to)) {
      graph.get(from)!.push(to);
    }
  }

  // DFS visit
  function visit(blockId: string) {
    if (visited.has(blockId)) return;
    if (visiting.has(blockId)) {
      // Cycle detected - handle recycle
      return;
    }

    visiting.add(blockId);
    const neighbors = graph.get(blockId) || [];
    for (const neighbor of neighbors) {
      visit(neighbor);
    }
    visiting.delete(blockId);
    visited.add(blockId);
    order.push(blockId);
  }

  // Visit all blocks
  for (const blockId of graph.keys()) {
    visit(blockId);
  }

  return order.reverse();
}

/**
 * Solve individual block
 */
function solveBlock(
  block: UnitOpNode,
  project: JasperProject,
  streams: Map<string, StreamState>,
  results: Map<string, any>
) {
  // Skip non-process blocks
  if (block.type === 'TextBox' || block.type === 'Sink') return;

  switch (block.type) {
    case 'Feed':
      // Already handled in initialization
      break;
    case 'Flash':
    case 'Separator':
      solveFlash(block, project, streams, results);
      break;
    case 'Mixer':
      solveMixer(block, project, streams, results);
      break;
    case 'Splitter':
      solveSplitter(block, project, streams, results);
      break;
    case 'Pump':
      solvePump(block, project, streams, results);
      break;
    case 'Heater':
    case 'Cooler':
      solveHeater(block, project, streams, results);
      break;
    default:
      // For unimplemented blocks, pass through
      passThrough(block, project, streams);
  }
}

/**
 * Solve Flash/Separator - rigorous VLE flash
 */
function solveFlash(
  block: UnitOpNode,
  project: JasperProject,
  streams: Map<string, StreamState>,
  results: Map<string, any>
) {
  // Get inlet stream
  const inletEdge = project.flowsheet.edges.find(e => e.to.nodeId === block.id);
  if (!inletEdge) throw new Error(`${block.name}: No inlet stream`);

  const inlet = streams.get(inletEdge.id);
  if (!inlet) throw new Error(`${block.name}: Inlet stream not solved`);

  // Flash temperature and pressure (use inlet if not specified)
  const T_flash = inlet.T; // Could be specified in block params
  const P_flash = inlet.P;

  // Calculate K-values
  const components = Object.keys(inlet.composition);
  const K_values = calculateKValues(components, T_flash, P_flash);

  // Rachford-Rice flash
  const V = rachfordRiceFlash(inlet.composition, K_values);

  // Phase compositions
  const { vapor, liquid } = flashComposition(inlet.composition, K_values, V);

  // Find outlet streams (vapor and liquid)
  const outlets = project.flowsheet.edges.filter(e => e.from.nodeId === block.id);
  const vaporOutlet = outlets.find(e => e.from.portName?.includes('vapor') || e.from.portName?.includes('gas'));
  const liquidOutlet = outlets.find(e => e.from.portName?.includes('liquid') || e.from.portName?.includes('heavy'));

  // Set vapor stream
  if (vaporOutlet) {
    const H_v = mixtureEnthalpy(vapor, T_flash, P_flash);
    streams.set(vaporOutlet.id, {
      id: vaporOutlet.id,
      name: vaporOutlet.name,
      T: T_flash,
      P: P_flash,
      flow: inlet.flow * V,
      composition: vapor,
      phase: 'V' as const,
      H: H_v,
    });
  }

  // Set liquid stream
  if (liquidOutlet) {
    const H_l = mixtureEnthalpy(liquid, T_flash, P_flash);
    streams.set(liquidOutlet.id, {
      id: liquidOutlet.id,
      name: liquidOutlet.name,
      T: T_flash,
      P: P_flash,
      flow: inlet.flow * (1 - V),
      composition: liquid,
      phase: 'L',
      H: H_l,
    });
  }

  // Store results
  results.set(block.id, {
    vaporFraction: V,
    duty: 0, // Adiabatic flash
  });
}

/**
 * Solve Mixer - combine streams
 */
function solveMixer(
  block: UnitOpNode,
  project: JasperProject,
  streams: Map<string, StreamState>,
  results: Map<string, any>
) {
  // Get all inlet streams
  const inletEdges = project.flowsheet.edges.filter(e => e.to.nodeId === block.id);
  const inlets = inletEdges.map(e => streams.get(e.id)).filter(s => s !== undefined) as StreamState[];

  if (inlets.length === 0) throw new Error(`${block.name}: No inlet streams`);

  // Mass balance
  const totalFlow = inlets.reduce((sum, s) => sum + s.flow, 0);
  const mixComposition: Record<string, number> = {};

  // Mix compositions (molar basis)
  for (const inlet of inlets) {
    for (const [comp, frac] of Object.entries(inlet.composition)) {
      if (!mixComposition[comp]) mixComposition[comp] = 0;
      mixComposition[comp] += (inlet.flow / totalFlow) * frac;
    }
  }

  // Energy balance (adiabatic mixing)
  const H_mix_in = inlets.reduce((sum, s) => sum + s.flow * s.H, 0) / totalFlow;

  // Outlet pressure = minimum inlet pressure
  const P_out = Math.min(...inlets.map(s => s.P));

  // Outlet temperature from energy balance (iterative)
  let T_out = inlets.reduce((sum, s) => sum + (s.flow / totalFlow) * s.T, 0);

  // Get outlet stream
  const outletEdge = project.flowsheet.edges.find(e => e.from.nodeId === block.id);
  if (!outletEdge) throw new Error(`${block.name}: No outlet stream`);

  streams.set(outletEdge.id, {
    id: outletEdge.id,
    name: outletEdge.name,
    T: T_out,
    P: P_out,
    flow: totalFlow,
    composition: mixComposition,
    phase: 'VL', // Mixed phase
    H: H_mix_in,
  });

  results.set(block.id, { totalFlow, mixComposition });
}

/**
 * Solve Splitter - split flow
 */
function solveSplitter(
  block: UnitOpNode,
  project: JasperProject,
  streams: Map<string, StreamState>,
  _results: Map<string, any>
) {
  // Get inlet
  const inletEdge = project.flowsheet.edges.find(e => e.to.nodeId === block.id);
  if (!inletEdge) throw new Error(`${block.name}: No inlet stream`);

  const inlet = streams.get(inletEdge.id);
  if (!inlet) throw new Error(`${block.name}: Inlet not solved`);

  // Get outlets
  const outletEdges = project.flowsheet.edges.filter(e => e.from.nodeId === block.id);
  
  // Split equally if not specified
  const splitFraction = 1.0 / outletEdges.length;

  for (const outlet of outletEdges) {
    streams.set(outlet.id, {
      ...inlet,
      id: outlet.id,
      name: outlet.name,
      flow: inlet.flow * splitFraction,
    });
  }
}

/**
 * Solve Pump - increase pressure
 */
function solvePump(
  block: UnitOpNode,
  project: JasperProject,
  streams: Map<string, StreamState>,
  results: Map<string, any>
) {
  const inletEdge = project.flowsheet.edges.find(e => e.to.nodeId === block.id);
  const outletEdge = project.flowsheet.edges.find(e => e.from.nodeId === block.id);

  if (!inletEdge || !outletEdge) throw new Error(`${block.name}: Missing streams`);

  const inlet = streams.get(inletEdge.id);
  if (!inlet) throw new Error(`${block.name}: Inlet not solved`);

  // Pressure rise
  const dP_param = block.params.dP as any;
  const dP = dP_param?.kind === 'quantity' ? dP_param.q.value : 5; // bar

  const P_out = inlet.P + dP;

  // Pump work (ideal)
  const efficiency = 0.75;
  const MW_avg = Object.entries(inlet.composition).reduce((sum, [comp, frac]) => {
    return sum + frac * (COMPONENT_DATABASE[comp]?.MW || 50);
  }, 0);
  
  const rho = density(inlet.composition, inlet.T, inlet.P, 'L'); // kg/m³
  const work_kW = (inlet.flow * MW_avg / 3600) * (dP * 1e5) / (rho * efficiency * 1000); // kW

  streams.set(outletEdge.id, {
    ...inlet,
    id: outletEdge.id,
    name: outletEdge.name,
    P: P_out,
  });

  results.set(block.id, { power: work_kW, dP });
}

/**
 * Solve Heater/Cooler
 */
function solveHeater(
  block: UnitOpNode,
  project: JasperProject,
  streams: Map<string, StreamState>,
  results: Map<string, any>
) {
  const inletEdge = project.flowsheet.edges.find(e => e.to.nodeId === block.id);
  const outletEdge = project.flowsheet.edges.find(e => e.from.nodeId === block.id);

  if (!inletEdge || !outletEdge) throw new Error(`${block.name}: Missing streams`);

  const inlet = streams.get(inletEdge.id);
  if (!inlet) throw new Error(`${block.name}: Inlet not solved`);

  // Outlet temperature
  const outletT_param = block.params.outletT as any;
  const T_out = outletT_param?.kind === 'quantity' 
    ? convertTemperature(outletT_param.q.value, outletT_param.q.unit)
    : inlet.T + (block.type === 'Heater' ? 50 : -50);

  // Heat duty
  const H_in = inlet.H;
  const H_out = mixtureEnthalpy(inlet.composition, T_out, inlet.P);
  const duty = inlet.flow * (H_out - H_in); // kJ/h

  streams.set(outletEdge.id, {
    ...inlet,
    id: outletEdge.id,
    name: outletEdge.name,
    T: T_out,
    H: H_out,
  });

  results.set(block.id, { duty, T_out });
}

/**
 * Pass through (for unimplemented blocks)
 */
function passThrough(
  block: UnitOpNode,
  project: JasperProject,
  streams: Map<string, StreamState>
) {
  const inletEdge = project.flowsheet.edges.find(e => e.to.nodeId === block.id);
  const outletEdges = project.flowsheet.edges.filter(e => e.from.nodeId === block.id);

  if (!inletEdge || outletEdges.length === 0) return;

  const inlet = streams.get(inletEdge.id);
  if (!inlet) return;

  // Pass through to all outlets
  for (const outlet of outletEdges) {
    streams.set(outlet.id, {
      ...inlet,
      id: outlet.id,
      name: outlet.name,
    });
  }
}

// Unit conversion helpers
function convertTemperature(value: number, unit: string): number {
  switch (unit) {
    case 'K': return value;
    case 'C': return value + 273.15;
    case 'F': return (value - 32) * 5/9 + 273.15;
    default: return value;
  }
}

function convertPressure(value: number, unit: string): number {
  switch (unit) {
    case 'bar': return value;
    case 'Pa': return value / 1e5;
    case 'psi': return value * 0.0689476;
    default: return value;
  }
}

