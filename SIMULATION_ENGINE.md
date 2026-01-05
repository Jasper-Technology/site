# Simulation Engine Integration

Jasper includes an enhanced simulation engine architecture that supports integration with external chemical engineering simulation libraries.

## Current Implementation

The current implementation uses `EnhancedJasperSim`, an enhanced deterministic simulation engine that:

- Computes KPIs using chemical engineering heuristics
- Evaluates specifications (purity, recovery, capture)
- Checks constraint violations
- Calculates Cost of Manufacturing (COM)

## Architecture

The simulation engine follows an interface-based design:

```typescript
interface SimulationEngine {
  name: string;
  run(project: JasperProject, versionId: string): Promise<SimulationRun>;
}
```

This allows easy swapping of simulation backends.

## Integration Options

### 1. DWSIM Integration

DWSIM is an open-source chemical process simulator with comprehensive unit operations and thermodynamic models.

**Integration Approach:**
- Set up a Python backend service that uses DWSIM's automation API
- Create a REST API endpoint that accepts project JSON and returns simulation results
- Implement `DWSIMEngine` class that calls the backend API

**Example Implementation:**
```typescript
export class DWSIMEngine implements SimulationEngine {
  name = 'dwsim';
  
  async run(project: JasperProject, versionId: string): Promise<...> {
    const response = await fetch('/api/dwsim/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return response.json();
  }
}
```

**Resources:**
- DWSIM Website: https://dwsim.org/
- DWSIM GitHub: https://github.com/DanWBR/dwsim

### 2. Cantera Integration

Cantera provides chemical kinetics, thermodynamics, and transport calculations.

**Integration Approach:**
- Use Cantera's Python API via a backend service
- Focus on thermodynamic property calculations and reaction kinetics
- Integrate for reactor and combustion simulations

**Resources:**
- Cantera Website: https://cantera.org/
- Cantera GitHub: https://github.com/Cantera/cantera

### 3. Process PI Integration

Process PI is a Python toolkit for chemical process systems.

**Integration Approach:**
- Similar to DWSIM - backend Python service
- Good for pipeline, heat exchanger, and mixer simulations
- Provides visualization tools

**Resources:**
- Process PI Website: https://processpi.org/

### 4. WebAssembly Integration

For client-side simulations, consider compiling simulation libraries to WebAssembly:

- Compile C/C++ simulation code to WASM
- Use Emscripten or similar tools
- Run simulations directly in the browser

## Implementation Steps

1. **Choose a Simulation Engine**
   - Evaluate features needed for your use cases
   - Consider licensing, performance, and maintenance

2. **Set Up Backend Service** (if needed)
   - Create Python/Node.js service
   - Expose REST API endpoints
   - Handle project conversion to simulator format

3. **Implement Engine Class**
   - Create new class implementing `SimulationEngine`
   - Handle data format conversion
   - Map simulator results to Jasper's data model

4. **Update Factory Function**
   - Modify `getSimulationEngine()` in `src/sim/engine.ts`
   - Add configuration to select engine
   - Support multiple engines simultaneously

5. **Add Error Handling**
   - Handle simulation failures gracefully
   - Provide meaningful error messages
   - Log simulation details for debugging

## Example: Adding DWSIM Support

```typescript
// src/sim/dwsim.ts
export class DWSIMEngine implements SimulationEngine {
  name = 'dwsim';
  private apiUrl = process.env.REACT_APP_DWSIM_API_URL || 'http://localhost:8000';

  async run(project: JasperProject, versionId: string): Promise<...> {
    try {
      // Convert Jasper project to DWSIM format
      const dwsimProject = this.convertToDWSIM(project);
      
      // Call DWSIM API
      const response = await fetch(`${this.apiUrl}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dwsimProject),
      });

      if (!response.ok) {
        throw new Error(`DWSIM simulation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Convert DWSIM results to Jasper format
      return this.convertFromDWSIM(result, project, versionId);
    } catch (error) {
      console.error('DWSIM simulation error:', error);
      throw error;
    }
  }

  private convertToDWSIM(project: JasperProject): any {
    // Implementation to convert Jasper project format to DWSIM format
    // This would map nodes, edges, specs, etc.
  }

  private convertFromDWSIM(result: any, project: JasperProject, versionId: string): any {
    // Implementation to convert DWSIM results to Jasper SimulationRun format
  }
}
```

## Testing

When integrating a new simulation engine:

1. Test with simple flowsheets first
2. Verify KPI calculations match expected ranges
3. Test error handling with invalid inputs
4. Compare results with known-good simulations
5. Performance test with large flowsheets

## Future Enhancements

- Support for dynamic simulations
- Real-time simulation updates
- Parallel simulation runs
- Simulation result caching
- Integration with optimization algorithms

