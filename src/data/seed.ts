import { generateId } from '../core/ids';
import type {
  ThermoConfig,
  Component,
  FlowsheetGraph,
  UnitOpNode,
  StreamEdge,
  SpecSet,
  ConstraintSet,
  Objective,
  EconomicConfig,
} from '../core/schema';

export function createBlankTemplate(): {
  thermodynamics: ThermoConfig;
  components: Component[];
  flowsheet: FlowsheetGraph;
  specs: SpecSet;
  constraints: ConstraintSet;
  objective: Objective;
  economics: EconomicConfig;
} {
  return {
    thermodynamics: {
      propertyMethod: 'NRTL',
      eos: 'PR',
    },
    components: [],
    flowsheet: {
      nodes: [],
      edges: [],
      layout: { nodes: {} },
    },
    specs: {
      specs: [],
    },
    constraints: {
      constraints: [],
    },
    objective: {
      metric: 'COM',
      sense: 'min',
    },
    economics: {
      steamPrice: 10, // $/GJ
      electricityPrice: 0.1, // $/kWh
      co2Price: 50, // $/ton
      capexFactor: 0.1,
    },
  };
}

/**
 * Simple Gas Processing Plant Template
 * - Only uses implemented V2 blocks (Feed, Mixer, Heater, Flash, Cooler, Pump, Sink)
 * - Full specifications for all inlet streams
 * - All compositions sum to 1.0
 * - Realistic process parameters
 * - Demonstrates rigorous thermodynamic calculations
 */
export function createSimpleGasPlantTemplate(): {
  thermodynamics: ThermoConfig;
  components: Component[];
  flowsheet: FlowsheetGraph;
  specs: SpecSet;
  constraints: ConstraintSet;
  objective: Objective;
  economics: EconomicConfig;
} {
  // Component IDs
  const co2Id = generateId('comp');
  const n2Id = generateId('comp');
  const h2oId = generateId('comp');

  // Define components
  const components: Component[] = [
    { id: co2Id, name: 'CO2', formula: 'CO2', role: 'solute' },
    { id: n2Id, name: 'N2', formula: 'N2', role: 'inert' },
    { id: h2oId, name: 'H2O', formula: 'H2O', role: 'solvent' },
  ];

  // Generate block IDs
  const feed1Id = generateId('node');
  const feed2Id = generateId('node');
  const mixerId = generateId('node');
  const heaterId = generateId('node');
  const flashId = generateId('node');
  const coolerId = generateId('node');
  const pumpId = generateId('node');
  const sink1Id = generateId('node');
  const sink2Id = generateId('node');

  // Create blocks
  const nodes: UnitOpNode[] = [
    // Feed 1: CO2-rich gas stream
    {
      id: feed1Id,
      type: 'Feed',
      name: 'Gas Feed',
      params: {},
      ports: [
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'V' },
      ],
    },
    // Feed 2: Water stream
    {
      id: feed2Id,
      type: 'Feed',
      name: 'Water Feed',
      params: {},
      ports: [
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },
    // Mixer: Combine streams
    {
      id: mixerId,
      type: 'Mixer',
      name: 'Mixer',
      params: {},
      ports: [
        { id: generateId('port'), name: 'in1', direction: 'in', phase: 'VL' },
        { id: generateId('port'), name: 'in2', direction: 'in', phase: 'VL' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'VL' },
      ],
    },
    // Heater: Heat to flash temperature
    {
      id: heaterId,
      type: 'Heater',
      name: 'Heater',
      params: {
        outletT: { kind: 'quantity', q: { value: 350, unit: 'K' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'VL' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'VL' },
      ],
    },
    // Flash: Separate vapor and liquid
    {
      id: flashId,
      type: 'Flash',
      name: 'Flash Separator',
      params: {
        T: { kind: 'quantity', q: { value: 300, unit: 'K' } },
        P: { kind: 'quantity', q: { value: 2, unit: 'bar' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'VL' },
        { id: generateId('port'), name: 'vapor', direction: 'out', phase: 'V' },
        { id: generateId('port'), name: 'liquid', direction: 'out', phase: 'L' },
      ],
    },
    // Cooler: Cool liquid stream
    {
      id: coolerId,
      type: 'Cooler',
      name: 'Cooler',
      params: {
        outletT: { kind: 'quantity', q: { value: 280, unit: 'K' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },
    // Pump: Increase pressure
    {
      id: pumpId,
      type: 'Pump',
      name: 'Pump',
      params: {
        dP: { kind: 'quantity', q: { value: 1, unit: 'bar' } },
        efficiency: { kind: 'number', x: 0.75 },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },
    // Sink 1: Vapor product
    {
      id: sink1Id,
      type: 'Sink',
      name: 'Vapor Product',
      params: {},
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'V' },
      ],
    },
    // Sink 2: Liquid product
    {
      id: sink2Id,
      type: 'Sink',
      name: 'Liquid Product',
      params: {},
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
      ],
    },
  ];

  // Create streams with full specifications
  const edges: StreamEdge[] = [
    // Feed 1 → Mixer (Gas stream)
    {
      id: generateId('stream'),
      name: 'S1-Gas',
      from: { nodeId: feed1Id, portName: 'out' },
      to: { nodeId: mixerId, portName: 'in1' },
      spec: {
        T: { value: 300, unit: 'K' },
        P: { value: 1.5, unit: 'bar' },
        flow: { value: 100, unit: 'kmol/h' },
        composition: {
          [co2Id]: 0.2,
          [n2Id]: 0.7,
          [h2oId]: 0.1,
        },
        phase: 'V',
      },
    },
    // Feed 2 → Mixer (Water stream)
    {
      id: generateId('stream'),
      name: 'S2-Water',
      from: { nodeId: feed2Id, portName: 'out' },
      to: { nodeId: mixerId, portName: 'in2' },
      spec: {
        T: { value: 298, unit: 'K' },
        P: { value: 1.5, unit: 'bar' },
        flow: { value: 50, unit: 'kmol/h' },
        composition: {
          [co2Id]: 0.0,
          [n2Id]: 0.0,
          [h2oId]: 1.0,
        },
        phase: 'L',
      },
    },
    // Mixer → Heater
    {
      id: generateId('stream'),
      name: 'S3-Mixed',
      from: { nodeId: mixerId, portName: 'out' },
      to: { nodeId: heaterId, portName: 'in' },
    },
    // Heater → Flash
    {
      id: generateId('stream'),
      name: 'S4-Heated',
      from: { nodeId: heaterId, portName: 'out' },
      to: { nodeId: flashId, portName: 'in' },
    },
    // Flash vapor → Sink
    {
      id: generateId('stream'),
      name: 'S5-Vapor',
      from: { nodeId: flashId, portName: 'vapor' },
      to: { nodeId: sink1Id, portName: 'in' },
    },
    // Flash liquid → Cooler
    {
      id: generateId('stream'),
      name: 'S6-Liquid',
      from: { nodeId: flashId, portName: 'liquid' },
      to: { nodeId: coolerId, portName: 'in' },
    },
    // Cooler → Pump
    {
      id: generateId('stream'),
      name: 'S7-Cooled',
      from: { nodeId: coolerId, portName: 'out' },
      to: { nodeId: pumpId, portName: 'in' },
    },
    // Pump → Sink
    {
      id: generateId('stream'),
      name: 'S8-Product',
      from: { nodeId: pumpId, portName: 'out' },
      to: { nodeId: sink2Id, portName: 'in' },
    },
  ];

  // Layout positions
  const layout = {
    nodes: {
      [feed1Id]: { x: 50, y: 50 },
      [feed2Id]: { x: 50, y: 200 },
      [mixerId]: { x: 250, y: 125 },
      [heaterId]: { x: 450, y: 125 },
      [flashId]: { x: 650, y: 125 },
      [coolerId]: { x: 850, y: 200 },
      [pumpId]: { x: 1050, y: 200 },
      [sink1Id]: { x: 850, y: 50 },
      [sink2Id]: { x: 1250, y: 200 },
    },
  };

  return {
    thermodynamics: {
      propertyMethod: 'NRTL',
      eos: 'PR',
    },
    components,
    flowsheet: {
      nodes,
      edges,
      layout,
    },
    specs: {
      specs: [],
    },
    constraints: {
      constraints: [],
    },
    objective: {
      metric: 'COM',
      sense: 'min',
    },
    economics: {
      steamPrice: 10,
      electricityPrice: 0.1,
      co2Price: 50,
      capexFactor: 0.1,
    },
  };
}

/**
 * DEPRECATED: CO2 Capture Process Template
 * This template uses unimplemented blocks (Absorber, Stripper, HeatExchanger)
 * Use createSimpleGasPlantTemplate() instead
 */
export function createDEACO2CaptureTemplate(): {
  thermodynamics: ThermoConfig;
  components: Component[];
  flowsheet: FlowsheetGraph;
  specs: SpecSet;
  constraints: ConstraintSet;
  objective: Objective;
  economics: EconomicConfig;
} {
  // Component IDs (must be consistent throughout)
  const co2Id = generateId('comp');
  const n2Id = generateId('comp');
  const meaId = generateId('comp');
  const h2oId = generateId('comp');

  // Define components first
  const components: Component[] = [
    { id: co2Id, name: 'CO2', formula: 'CO2', role: 'solute' },
    { id: n2Id, name: 'N2', formula: 'N2', role: 'inert' },
    { id: meaId, name: 'MEA', formula: 'C2H7NO', role: 'solvent' },
    { id: h2oId, name: 'H2O', formula: 'H2O', role: 'solvent' },
  ];

  // Generate stable IDs for all blocks
  const flueGasFeedId = generateId('node');
  const leanMakeupId = generateId('node'); // Makeup lean solvent feed
  const absorberId = generateId('node');
  const richLeanHxId = generateId('node');
  const stripperId = generateId('node');
  const heaterIdId = generateId('node'); // Reboiler
  const leanPumpId = generateId('node');
  const leanCoolerId = generateId('node');
  const treatedGasSinkId = generateId('node');
  const co2ProductSinkId = generateId('node');

  // Create blocks with full specifications
  const nodes: UnitOpNode[] = [
    // ========== FEEDS ==========
    {
      id: flueGasFeedId,
      type: 'Feed',
      name: 'Flue Gas Feed',
      params: {},
      ports: [
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'V' },
      ],
    },
    {
      id: leanMakeupId,
      type: 'Feed',
      name: 'Lean Makeup',
      params: {},
      ports: [
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },
    
    // ========== ABSORBER ==========
    {
      id: absorberId,
      type: 'Absorber',
      name: 'Absorber',
      params: {
        stages: { kind: 'int', n: 20 },
        P: { kind: 'quantity', q: { value: 1.1, unit: 'bar' } },
      },
      ports: [
        { id: generateId('port'), name: 'gas-in', direction: 'in', phase: 'V' },
        { id: generateId('port'), name: 'liquid-in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'gas-out', direction: 'out', phase: 'V' },
        { id: generateId('port'), name: 'liquid-out', direction: 'out', phase: 'L' },
      ],
    },

    // ========== HEAT EXCHANGER ==========
    {
      id: richLeanHxId,
      type: 'HeatExchanger',
      name: 'Rich/Lean HX',
      params: {
        UA: { kind: 'quantity', q: { value: 500, unit: 'kW/K' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
        { id: generateId('port'), name: 'cold-in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'cold-out', direction: 'out', phase: 'L' },
      ],
    },

    // ========== STRIPPER ==========
    {
      id: stripperId,
      type: 'Stripper',
      name: 'Stripper',
      params: {
        stages: { kind: 'int', n: 10 },
        P: { kind: 'quantity', q: { value: 1.8, unit: 'bar' } },
      },
      ports: [
        { id: generateId('port'), name: 'feed', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'overhead', direction: 'out', phase: 'V' },
        { id: generateId('port'), name: 'bottoms', direction: 'out', phase: 'L' },
      ],
    },

    // ========== REBOILER ==========
    {
      id: heaterIdId,
      type: 'Heater',
      name: 'Reboiler',
      params: {
        outletT: { kind: 'quantity', q: { value: 120, unit: 'C' } },
        duty: { kind: 'quantity', q: { value: 2500, unit: 'kW' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },

    // ========== LEAN PUMP ==========
    {
      id: leanPumpId,
      type: 'Pump',
      name: 'Lean Pump',
      params: {
        dP: { kind: 'quantity', q: { value: 0.5, unit: 'bar' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },

    // ========== LEAN COOLER ==========
    {
      id: leanCoolerId,
      type: 'Cooler',
      name: 'Lean Cooler',
      params: {
        outletT: { kind: 'quantity', q: { value: 40, unit: 'C' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },

    // ========== OUTLETS (SINKS) ==========
    {
      id: treatedGasSinkId,
      type: 'Sink',
      name: 'Treated Gas',
      params: {},
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'V' },
      ],
    },
    {
      id: co2ProductSinkId,
      type: 'Sink',
      name: 'CO2 Product',
      params: {},
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'V' },
      ],
    },
  ];

  // Create stream IDs for important streams
  const flueGasStreamId = generateId('stream');
  const treatedGasStreamId = generateId('stream');
  const co2ProductStreamId = generateId('stream');

  // Create streams with COMPLETE specifications
  const edges: StreamEdge[] = [
    // 1. Flue Gas (Feed → Absorber) - FULLY SPECIFIED
    {
      id: flueGasStreamId,
      name: 'S1-Flue-Gas',
      from: { nodeId: flueGasFeedId, portName: 'out' },
      to: { nodeId: absorberId, portName: 'gas-in' },
      spec: {
        T: { value: 40, unit: 'C' },
        P: { value: 1.05, unit: 'bar' },
        flow: { value: 1000, unit: 'kmol/h' },
        composition: {
          [co2Id]: 0.13,  // 13% CO2 (typical flue gas)
          [n2Id]: 0.87,   // 87% N2 (balance)
        },
        phase: 'V',
      },
    },

    // 2. Lean Makeup (Feed → Cooler) - FULLY SPECIFIED
    {
      id: generateId('stream'),
      name: 'S2-Lean-Makeup',
      from: { nodeId: leanMakeupId, portName: 'out' },
      to: { nodeId: leanCoolerId, portName: 'in' },
      spec: {
        T: { value: 60, unit: 'C' },
        P: { value: 1.6, unit: 'bar' },
        flow: { value: 5000, unit: 'kmol/h' },
        composition: {
          [meaId]: 0.30,  // 30 wt% MEA solution
          [h2oId]: 0.70,  // 70 wt% water
        },
        phase: 'L',
      },
    },

    // 3. Lean Solvent (Cooler → Absorber)
    {
      id: generateId('stream'),
      name: 'S3-Lean-Solvent',
      from: { nodeId: leanCoolerId, portName: 'out' },
      to: { nodeId: absorberId, portName: 'liquid-in' },
    },

    // 4. Treated Gas (Absorber → Sink)
    {
      id: treatedGasStreamId,
      name: 'S4-Treated-Gas',
      from: { nodeId: absorberId, portName: 'gas-out' },
      to: { nodeId: treatedGasSinkId, portName: 'in' },
    },

    // 5. Rich Solvent (Absorber → HX hot side)
    {
      id: generateId('stream'),
      name: 'S5-Rich-Solvent',
      from: { nodeId: absorberId, portName: 'liquid-out' },
      to: { nodeId: richLeanHxId, portName: 'in' },
    },

    // 6. Rich Heated (HX → Stripper)
    {
      id: generateId('stream'),
      name: 'S6-Rich-Heated',
      from: { nodeId: richLeanHxId, portName: 'out' },
      to: { nodeId: stripperId, portName: 'feed' },
    },

    // 7. CO2 Product (Stripper → Sink)
    {
      id: co2ProductStreamId,
      name: 'S7-CO2-Product',
      from: { nodeId: stripperId, portName: 'overhead' },
      to: { nodeId: co2ProductSinkId, portName: 'in' },
    },

    // 8. Lean Hot (Stripper → Reboiler) - RECYCLE
    {
      id: generateId('stream'),
      name: 'S8-Lean-Hot',
      from: { nodeId: stripperId, portName: 'bottoms' },
      to: { nodeId: heaterIdId, portName: 'in' },
    },

    // 9. Lean from Reboiler (Reboiler → HX cold side)
    {
      id: generateId('stream'),
      name: 'S9-Lean-Reboiler',
      from: { nodeId: heaterIdId, portName: 'out' },
      to: { nodeId: richLeanHxId, portName: 'cold-in' },
    },

    // 10. Lean Cooled (HX → Pump)
    {
      id: generateId('stream'),
      name: 'S10-Lean-Cooled',
      from: { nodeId: richLeanHxId, portName: 'cold-out' },
      to: { nodeId: leanPumpId, portName: 'in' },
    },

    // 11. Lean Pumped (Pump → Cooler) - RECYCLE CLOSES HERE
    {
      id: generateId('stream'),
      name: 'S11-Lean-Pumped',
      from: { nodeId: leanPumpId, portName: 'out' },
      to: { nodeId: leanCoolerId, portName: 'in' },
    },
  ];

  return {
    thermodynamics: {
      propertyMethod: 'NRTL',
      eos: 'PR',
      electrolytes: true,
    },
    components,
    flowsheet: {
      nodes,
      edges,
      layout: {
        nodes: {
          [flueGasFeedId]: { x: 100, y: 120 },
          [leanMakeupId]: { x: 100, y: 450 },
          [absorberId]: { x: 300, y: 200 },
          [treatedGasSinkId]: { x: 480, y: 80 },
          [richLeanHxId]: { x: 500, y: 300 },
          [stripperId]: { x: 700, y: 200 },
          [co2ProductSinkId]: { x: 880, y: 80 },
          [heaterIdId]: { x: 700, y: 380 },
          [leanPumpId]: { x: 500, y: 450 },
          [leanCoolerId]: { x: 300, y: 450 },
        },
      },
    },
    specs: {
      specs: [
        {
          id: generateId('spec'),
          type: 'capture',
          component: 'CO2',
          ventStreamId: treatedGasStreamId,
          targetRemoval: 0.90, // 90% CO2 capture target
        },
      ],
    },
    constraints: {
      constraints: [
        {
          id: generateId('constraint'),
          type: 'max',
          ref: { kind: 'kpi', metric: 'steam' },
          limit: 3500, // GJ/h maximum steam
          hard: false,
        },
        {
          id: generateId('constraint'),
          type: 'max',
          ref: { kind: 'kpi', metric: 'electricity' },
          limit: 200, // kW maximum power
          hard: false,
        },
      ],
    },
    objective: {
      metric: 'COM',
      sense: 'min',
    },
    economics: {
      steamPrice: 10, // $/GJ
      electricityPrice: 0.08, // $/kWh
      co2Price: 60, // $/ton captured
      capexFactor: 0.12,
    },
  };
}
