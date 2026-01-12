# Architecture Redesign: Block-Based Simulation Engine

## Problem Statement

Current architecture is over-complicated:
- Port-based connections are confusing
- Discriminated unions everywhere (ParamValue, MetricRef, etc.)
- Specs/Constraints/Objectives as separate entities
- Complex validation and solver logic
- Hard to debug and extend

## Solution: Block Coding Paradigm

Treat each unit operation as a **pure function block**:
- **Inputs** → **Block Function** → **Outputs**
- Simulation = execute blocks in dependency order
- No complex specs/constraints - just blocks and connections
- Each block is self-contained and testable

---

## New Architecture

### 1. Simplified Core Types

```typescript
// Core stream data (no more complex StreamSpec)
type StreamData = {
  T: number;        // Kelvin
  P: number;        // Pascal
  flow: number;     // kmol/h
  composition: Record<string, number>;  // Mole fractions
  phase: 'V' | 'L' | 'VL';

  // Optional calculated properties
  H?: number;       // Enthalpy (kJ/kmol)
  vaporFrac?: number;
};

// Block with inputs/outputs
type Block = {
  id: string;
  type: UnitType;
  name: string;
  x: number;
  y: number;

  // Simple params (no more discriminated unions!)
  params: Record<string, number | string | boolean>;

  // Runtime data (populated during simulation)
  inputs?: Record<string, StreamData>;
  outputs?: Record<string, StreamData>;

  // Block status
  status?: 'idle' | 'computing' | 'done' | 'error';
  error?: string;
};

// Simple connection
type Connection = {
  id: string;
  from: { blockId: string; port: string };
  to: { blockId: string; port: string };
};

// Project
type Project = {
  id: string;
  name: string;
  components: string[];  // ['H2O', 'CO2', 'MEA', 'N2']
  blocks: Block[];
  connections: Connection[];
};
```

### 2. Block Functions (Pure Functions)

Each block type has a pure function:

```typescript
type BlockFunction = (
  inputs: Record<string, StreamData>,
  params: Record<string, any>,
  components: string[]
) => {
  outputs: Record<string, StreamData>;
  duty?: number;      // For heaters/coolers (kW)
  power?: number;     // For pumps/compressors (kW)
  conversion?: number; // For reactors
};

const BLOCK_FUNCTIONS: Record<UnitType, BlockFunction> = {
  Feed: (inputs, params) => {
    // Feed blocks define their output directly from params
    return {
      outputs: {
        out: {
          T: params.T,
          P: params.P,
          flow: params.flow,
          composition: params.composition,
          phase: params.phase,
        }
      }
    };
  },

  Mixer: (inputs, params) => {
    const streams = Object.values(inputs);
    const totalFlow = streams.reduce((sum, s) => sum + s.flow, 0);

    // Mix compositions
    const composition: Record<string, number> = {};
    for (const comp of Object.keys(streams[0].composition)) {
      composition[comp] = streams.reduce((sum, s) =>
        sum + s.composition[comp] * s.flow, 0) / totalFlow;
    }

    // Average properties (simplified - can be more rigorous)
    const T = streams.reduce((sum, s) => sum + s.T * s.flow, 0) / totalFlow;
    const P = Math.min(...streams.map(s => s.P)); // Lowest pressure

    return {
      outputs: {
        out: { T, P, flow: totalFlow, composition, phase: 'VL' }
      }
    };
  },

  Heater: (inputs, params) => {
    const inlet = inputs.in;
    const outletT = params.outletT;

    // Calculate duty (simplified)
    const Cp = 30; // kJ/kmol/K (simplified)
    const duty = inlet.flow * Cp * (outletT - inlet.T);

    return {
      outputs: {
        out: { ...inlet, T: outletT }
      },
      duty
    };
  },

  Cooler: (inputs, params) => {
    const inlet = inputs.in;
    const outletT = params.outletT;

    const Cp = 30;
    const duty = inlet.flow * Cp * (inlet.T - outletT); // Positive = cooling

    return {
      outputs: {
        out: { ...inlet, T: outletT }
      },
      duty
    };
  },

  Flash: (inputs, params) => {
    const inlet = inputs.in;
    const T = params.T;
    const P = params.P;

    // Flash calculation (simplified - use real VLE)
    const { vapor, liquid, vaporFrac } = flashCalculation(inlet, T, P);

    return {
      outputs: { vapor, liquid }
    };
  },

  Compressor: (inputs, params) => {
    const inlet = inputs.in;
    const outletP = params.outletP;
    const efficiency = params.efficiency || 0.75;

    // Isentropic work (simplified)
    const gamma = 1.4;
    const compressionRatio = outletP / inlet.P;
    const T_out = inlet.T * Math.pow(compressionRatio, (gamma - 1) / gamma);
    const power = inlet.flow * 8.314 * inlet.T *
                  (Math.pow(compressionRatio, (gamma - 1) / gamma) - 1) /
                  (efficiency * (gamma - 1));

    return {
      outputs: {
        out: { ...inlet, P: outletP, T: T_out }
      },
      power
    };
  },

  Splitter: (inputs, params) => {
    const inlet = inputs.in;
    const split1 = params.split1; // Fraction to out1

    return {
      outputs: {
        out1: { ...inlet, flow: inlet.flow * split1 },
        out2: { ...inlet, flow: inlet.flow * (1 - split1) }
      }
    };
  },

  Reactor: (inputs, params) => {
    const inlet = inputs.in;
    const conversion = params.conversion;
    const T = params.T;
    const P = params.P;

    // Simple conversion reactor (e.g., N2 + 3H2 -> 2NH3)
    // Parse reaction and update composition
    const newComposition = applyReaction(inlet.composition, conversion, params.reaction);

    return {
      outputs: {
        out: {
          ...inlet,
          T,
          P,
          composition: newComposition
        }
      },
      conversion
    };
  }
};
```

### 3. Simple Simulation Engine

```typescript
function simulate(project: Project): SimulationResult {
  // 1. Clear all block inputs/outputs
  for (const block of project.blocks) {
    block.inputs = {};
    block.outputs = undefined;
    block.status = 'idle';
  }

  // 2. Find Feed blocks (entry points)
  const feeds = project.blocks.filter(b => b.type === 'Feed');

  if (feeds.length === 0) {
    return { error: 'No feed blocks found' };
  }

  // 3. Execute each feed's downstream path
  const executionLog: string[] = [];

  for (const feed of feeds) {
    executeBlock(feed, project, executionLog);
  }

  // 4. Return results
  return {
    success: true,
    blocks: project.blocks.map(b => ({
      id: b.id,
      name: b.name,
      outputs: b.outputs,
      status: b.status
    })),
    log: executionLog
  };
}

function executeBlock(
  block: Block,
  project: Project,
  log: string[]
): void {
  // Skip if already computed
  if (block.status === 'done') return;

  try {
    block.status = 'computing';

    // Get block function
    const blockFn = BLOCK_FUNCTIONS[block.type];

    // Execute
    const result = blockFn(block.inputs || {}, block.params, project.components);

    block.outputs = result.outputs;
    block.status = 'done';

    log.push(`✓ ${block.name} executed`);

    // Propagate outputs to connected blocks
    const outgoingConnections = project.connections.filter(
      c => c.from.blockId === block.id
    );

    for (const conn of outgoingConnections) {
      const downstreamBlock = project.blocks.find(b => b.id === conn.to.blockId);
      if (!downstreamBlock) continue;

      // Set input on downstream block
      if (!downstreamBlock.inputs) downstreamBlock.inputs = {};
      downstreamBlock.inputs[conn.to.port] = block.outputs[conn.from.port];

      // Recursively execute downstream
      executeBlock(downstreamBlock, project, log);
    }

  } catch (error) {
    block.status = 'error';
    block.error = error.message;
    log.push(`✗ ${block.name} failed: ${error.message}`);
  }
}
```

---

## Migration Strategy

### Phase 1: Create New Schema (Parallel to Old)
- Create `src/core/schema-v2.ts` with simplified types
- Don't touch existing schema yet

### Phase 2: Create New Simulation Engine
- Create `src/sim/engine-v2.ts` with block-based execution
- Implement block functions in `src/sim/blocks/`
- Keep old engine working

### Phase 3: Add Converter
- Create converter from old schema → new schema
- Projects can be migrated on load

### Phase 4: Switch UI to Use New Engine
- Update Editor to use new simulation engine
- Keep UI exactly the same (just change backend calls)

### Phase 5: Remove Old Code
- Delete old schema, old engine
- Clean up

---

## Benefits

1. **Simplicity**: No more complex schemas, everything is plain objects
2. **Debuggable**: Can log each block execution, inspect inputs/outputs
3. **Testable**: Each block function is pure, easy to unit test
4. **Extensible**: Adding a new block type = one new function
5. **Transparent**: UI can show exactly what's happening in each block
6. **Fast**: No topological sort, no complex validation, just execute

---

## UI Integration (No Changes Needed!)

The beautiful UI stays exactly the same:
- PFD Canvas still shows blocks and streams
- Inspector still shows selected block properties
- Console Drawer still shows results
- Just the backend changes

The only difference users will see:
- **Faster simulation** (simpler engine)
- **Clearer errors** (each block reports its own status)
- **Better debugging** (can see execution log)

---

## Next Steps

1. Shall I create the simplified schema (`schema-v2.ts`)?
2. Then implement the new simulation engine (`engine-v2.ts`)?
3. Create a simple test to show it working?

Let me know if this approach makes sense!
