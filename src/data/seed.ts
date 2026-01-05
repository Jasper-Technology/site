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

export function createDEACO2CaptureTemplate(): {
  thermodynamics: ThermoConfig;
  components: Component[];
  flowsheet: FlowsheetGraph;
  specs: SpecSet;
  constraints: ConstraintSet;
  objective: Objective;
  economics: EconomicConfig;
} {
  // Generate stable IDs for all nodes
  const feedId = generateId('node');
  const absorberId = generateId('node');
  const stripperId = generateId('node');
  const pumpId = generateId('node');
  const coolerId = generateId('node');
  const heId = generateId('node');
  const treatedGasOutletId = generateId('node'); // Outlet for treated gas
  const co2ProductOutletId = generateId('node'); // Outlet for CO2 product

  // Create nodes with ports that match the handle IDs in CustomNodes.tsx
  const nodes: UnitOpNode[] = [
    {
      id: feedId,
      type: 'Feed',
      name: 'Flue Gas',
      params: {
        flow: { kind: 'quantity', q: { value: 100, unit: 'kmol/h' } },
        T: { kind: 'quantity', q: { value: 40, unit: 'C' } },
        P: { kind: 'quantity', q: { value: 1, unit: 'bar' } },
      },
      ports: [
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },
    {
      id: absorberId,
      type: 'Absorber',
      name: 'Absorber',
      params: {
        stages: { kind: 'int', n: 20 },
      },
      ports: [
        { id: generateId('port'), name: 'gas-in', direction: 'in', phase: 'V' },
        { id: generateId('port'), name: 'liquid-in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'gas-out', direction: 'out', phase: 'V' },
        { id: generateId('port'), name: 'liquid-out', direction: 'out', phase: 'L' },
      ],
    },
    {
      id: stripperId,
      type: 'Stripper',
      name: 'Stripper',
      params: {
        stages: { kind: 'int', n: 10 },
        P: { kind: 'quantity', q: { value: 2, unit: 'bar' } },
      },
      ports: [
        { id: generateId('port'), name: 'feed', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'overhead', direction: 'out', phase: 'V' },
        { id: generateId('port'), name: 'bottoms', direction: 'out', phase: 'L' },
      ],
    },
    {
      id: pumpId,
      type: 'Pump',
      name: 'Lean Pump',
      params: {
        dP: { kind: 'quantity', q: { value: 5, unit: 'bar' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },
    {
      id: coolerId,
      type: 'Cooler',
      name: 'Lean Cooler',
      params: {
        T_out: { kind: 'quantity', q: { value: 40, unit: 'C' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
      ],
    },
    {
      id: heId,
      type: 'HeatExchanger',
      name: 'Rich/Lean HX',
      params: {
        UA: { kind: 'quantity', q: { value: 1000, unit: 'kW/K' } },
      },
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'L' },
        { id: generateId('port'), name: 'cold-in', direction: 'in', phase: 'L' },
        { id: generateId('port'), name: 'cold-out', direction: 'out', phase: 'L' },
      ],
    },
    // Outlet nodes (Feed type used as product outlets)
    {
      id: treatedGasOutletId,
      type: 'Feed',
      name: 'Treated Gas',
      params: {},
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'V' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'V' },
      ],
    },
    {
      id: co2ProductOutletId,
      type: 'Feed',
      name: 'CO2 Product',
      params: {},
      ports: [
        { id: generateId('port'), name: 'in', direction: 'in', phase: 'V' },
        { id: generateId('port'), name: 'out', direction: 'out', phase: 'V' },
      ],
    },
  ];

  // Create stream IDs
  const flueGasStreamId = generateId('stream');
  const treatedGasStreamId = generateId('stream');

  const edges: StreamEdge[] = [
    // Flue Gas → Absorber
    {
      id: flueGasStreamId,
      name: 'Flue Gas',
      from: { nodeId: feedId, portName: 'out' },
      to: { nodeId: absorberId, portName: 'gas-in' },
      spec: {
        T: { value: 40, unit: 'C' },
        P: { value: 1, unit: 'bar' },
        flow: { value: 100, unit: 'kmol/h' },
        composition: { CO2: 0.12, N2: 0.88 } as Record<string, number>,
        phase: 'V',
      },
    },
    // Lean Solvent (Cooler → Absorber)
    {
      id: generateId('stream'),
      name: 'Lean Solvent',
      from: { nodeId: coolerId, portName: 'out' },
      to: { nodeId: absorberId, portName: 'liquid-in' },
      spec: {
        T: { value: 40, unit: 'C' },
        P: { value: 1, unit: 'bar' },
        flow: { value: 500, unit: 'kmol/h' },
        phase: 'L',
      },
    },
    // Treated Gas (Absorber → Outlet)
    {
      id: treatedGasStreamId,
      name: 'Treated Gas',
      from: { nodeId: absorberId, portName: 'gas-out' },
      to: { nodeId: treatedGasOutletId, portName: 'in' },
      spec: {
        phase: 'V',
      },
    },
    // Rich Solvent (Absorber → HX)
    {
      id: generateId('stream'),
      name: 'Rich Solvent',
      from: { nodeId: absorberId, portName: 'liquid-out' },
      to: { nodeId: heId, portName: 'in' },
      spec: {
        phase: 'L',
      },
    },
    // Rich to Stripper (HX → Stripper)
    {
      id: generateId('stream'),
      name: 'Rich to Stripper',
      from: { nodeId: heId, portName: 'out' },
      to: { nodeId: stripperId, portName: 'feed' },
      spec: {
        phase: 'L',
      },
    },
    // CO2 Product (Stripper → Outlet)
    {
      id: generateId('stream'),
      name: 'CO2 Product',
      from: { nodeId: stripperId, portName: 'overhead' },
      to: { nodeId: co2ProductOutletId, portName: 'in' },
      spec: {
        phase: 'V',
      },
    },
    // Lean from Stripper (Stripper → HX cold side)
    {
      id: generateId('stream'),
      name: 'Lean from Stripper',
      from: { nodeId: stripperId, portName: 'bottoms' },
      to: { nodeId: heId, portName: 'cold-in' },
      spec: {
        phase: 'L',
      },
    },
    // Lean to Pump (HX → Pump)
    {
      id: generateId('stream'),
      name: 'Lean to Pump',
      from: { nodeId: heId, portName: 'cold-out' },
      to: { nodeId: pumpId, portName: 'in' },
      spec: {
        phase: 'L',
      },
    },
    // Lean to Cooler (Pump → Cooler)
    {
      id: generateId('stream'),
      name: 'Lean to Cooler',
      from: { nodeId: pumpId, portName: 'out' },
      to: { nodeId: coolerId, portName: 'in' },
      spec: {
        phase: 'L',
      },
    },
  ];

  return {
    thermodynamics: {
      propertyMethod: 'NRTL',
      eos: 'PR',
      electrolytes: true,
    },
    components: [
      { id: generateId('comp'), name: 'CO2', formula: 'CO2', role: 'solute' },
      { id: generateId('comp'), name: 'N2', formula: 'N2', role: 'inert' },
      { id: generateId('comp'), name: 'MDEA', formula: 'C5H13NO2', role: 'solvent' },
      { id: generateId('comp'), name: 'H2O', formula: 'H2O', role: 'solvent' },
    ],
    flowsheet: {
      nodes,
      edges,
      layout: {
        nodes: {
          [feedId]: { x: 80, y: 150 },
          [absorberId]: { x: 250, y: 150 },
          [treatedGasOutletId]: { x: 420, y: 50 },
          [heId]: { x: 420, y: 250 },
          [stripperId]: { x: 580, y: 150 },
          [co2ProductOutletId]: { x: 720, y: 50 },
          [pumpId]: { x: 350, y: 380 },
          [coolerId]: { x: 180, y: 380 },
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
          targetRemoval: 0.9,
        },
      ],
    },
    constraints: {
      constraints: [
        {
          id: generateId('constraint'),
          type: 'max',
          ref: { kind: 'kpi', metric: 'steam' },
          limit: 1000,
          hard: true,
        },
        {
          id: generateId('constraint'),
          type: 'max',
          ref: { kind: 'kpi', metric: 'electricity' },
          limit: 500,
          hard: true,
        },
      ],
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
