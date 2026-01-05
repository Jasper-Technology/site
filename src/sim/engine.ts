/**
 * Enhanced Simulation Engine
 * 
 * This module provides a bridge to integrate with external chemical engineering
 * simulation libraries like DWSIM, Cantera, or Process PI.
 * 
 * For now, it uses an enhanced deterministic simulation, but the architecture
 * supports integration with real simulation engines via:
 * - REST API calls to backend services
 * - WebAssembly modules
 * - Python backend via subprocess/API
 */

import type { JasperProject, SimulationRun } from '../core/schema';
import { stableHash } from '../core/hash';
import { evaluateMetricRef } from '../core/metrics';
import { computeCOM } from './economics';

export interface SimulationEngine {
  name: string;
  run(project: JasperProject, versionId: string): Promise<Omit<SimulationRun, 'runId' | 'projectId' | 'versionId' | 'createdAt'>>;
}

/**
 * Enhanced deterministic simulation engine
 * Uses more sophisticated heuristics based on chemical engineering principles
 */
export class EnhancedJasperSim implements SimulationEngine {
  name = 'jasperSim';

  async run(
    project: JasperProject,
    versionId: string
  ): Promise<Omit<SimulationRun, 'runId' | 'projectId' | 'versionId' | 'createdAt'>> {
    const inputsHash = stableHash({
      snapshot: project,
      versionId,
    });

    // Check graph validity
    const hasNodes = project.flowsheet.nodes.length > 0;
    const hasEdges = project.flowsheet.edges.length > 0;
    const feedNodes = project.flowsheet.nodes.filter(n => n.type === 'Feed');
    const hasConnectivity = feedNodes.length > 0 && hasEdges;

    const converged = hasNodes && hasEdges && hasConnectivity;

    if (!converged) {
      return {
        simulator: this.name,
        status: 'error',
        inputsHash,
        converged: false,
        kpis: {},
        specResults: [],
        violations: [],
        rawOutputs: {
          error: 'Graph connectivity issues detected',
        },
      };
    }

    // Enhanced KPI computation
    const kpis = this.computeKPIs(project);
    
    // Evaluate specs
    const specResults = this.evaluateSpecs(project, kpis);
    
    // Evaluate constraints
    const violations = this.evaluateConstraints(project, kpis);

    // Update COM with computed KPIs
    kpis.COM = computeCOM(
      {
        runId: '',
        projectId: project.projectId,
        versionId,
        createdAt: '',
        simulator: this.name,
        status: 'done',
        inputsHash,
        converged: true,
        kpis,
        specResults,
        violations,
      },
      project.economics
    );

    return {
      simulator: this.name,
      status: converged ? 'done' : 'error',
      inputsHash,
      converged,
      kpis,
      specResults,
      violations,
      rawOutputs: {
        achievedCapture: kpis.achievedCapture || 0,
        circulationRate: kpis.circulationRate || 0,
        totalStages: kpis.totalStages || 0,
      },
    };
  }

  private computeKPIs(project: JasperProject): Record<string, number> {
    const kpis: Record<string, number> = {};

    // Count equipment
    const pumps = project.flowsheet.nodes.filter(n => n.type === 'Pump');
    const compressors = project.flowsheet.nodes.filter(n => n.type === 'Compressor');
    const columns = project.flowsheet.nodes.filter(
      n => n.type === 'Absorber' || n.type === 'Stripper' || n.type === 'DistillationColumn'
    );
    const heatExchangers = project.flowsheet.nodes.filter(n => n.type === 'HeatExchanger');

    // Compute total stages
    let totalStages = 0;
    for (const node of columns) {
      const stagesParam = node.params.stages as any;
      if (stagesParam?.kind === 'int') {
        totalStages += stagesParam.n;
      } else if (stagesParam?.kind === 'number') {
        totalStages += Math.floor(stagesParam.x);
      }
    }
    kpis.totalStages = totalStages;

    // Compute circulation rate from solvent streams
    let circulationRate = 0;
    const solventStreams = project.flowsheet.edges.filter(e => {
      const spec = e.spec;
      return spec && (spec.phase === 'L' || spec.phase === 'VL');
    });
    if (solventStreams.length > 0) {
      circulationRate = solventStreams.reduce((sum, s) => {
        return sum + (s.spec?.flow?.value || 100);
      }, 0) / solventStreams.length;
    } else {
      circulationRate = 500; // Default
    }
    kpis.circulationRate = circulationRate;

    // Get stripper pressure
    let stripperPressure = 2; // bar default
    const stripper = project.flowsheet.nodes.find(n => n.type === 'Stripper');
    if (stripper) {
      const pParam = stripper.params.P as any;
      if (pParam?.kind === 'quantity') {
        stripperPressure = pParam.q.value;
      }
    }

    // Steam consumption (GJ/h)
    // Based on: reboiler duty for stripper + any heaters
    let steam = 0;
    
    // Stripper reboiler duty (increases with circulation, decreases with pressure)
    if (stripper) {
      const baseDuty = circulationRate * 0.5; // GJ/h per kmol/h
      const pressureFactor = 1 / Math.max(0.5, stripperPressure);
      steam += baseDuty * pressureFactor;
    }

    // Heater duties
    const heaters = project.flowsheet.nodes.filter(n => n.type === 'Heater');
    for (const heater of heaters) {
      const dutyParam = heater.params.duty as any;
      if (dutyParam?.kind === 'quantity') {
        steam += dutyParam.q.value * 0.001; // Convert kW to GJ/h (approximate)
      } else {
        steam += 50; // Default heater duty
      }
    }

    kpis.steam = Math.max(100, steam);

    // Electricity consumption (kWh)
    let electricity = 0;
    
    // Pump power
    for (const pump of pumps) {
      const powerParam = pump.params.power as any;
      if (powerParam?.kind === 'quantity') {
        electricity += powerParam.q.value;
      } else {
        const dPParam = pump.params.dP as any;
        if (dPParam?.kind === 'quantity') {
          // Power = flow * dP / efficiency
          electricity += (circulationRate * dPParam.q.value) / 100; // Simplified
        } else {
          electricity += 20; // Default
        }
      }
    }

    // Compressor power
    for (const compressor of compressors) {
      const powerParam = compressor.params.power as any;
      if (powerParam?.kind === 'quantity') {
        electricity += powerParam.q.value;
      } else {
        electricity += 100; // Default compressor power
      }
    }

    kpis.electricity = electricity;

    // CAPEX proxy (scaled cost units)
    kpis.CAPEX_proxy = (
      project.flowsheet.nodes.length * 100 +
      totalStages * 50 +
      heatExchangers.length * 150
    );

    // Achieved capture (for CO2 processes)
    let achievedCapture = 0.5;
    if (totalStages > 0) {
      achievedCapture = Math.min(0.99, 0.5 + (totalStages / 50) * 0.4);
    }
    if (circulationRate > 400) {
      achievedCapture = Math.min(0.99, achievedCapture + 0.2);
    }
    kpis.achievedCapture = achievedCapture;

    // CO2 emissions (ton/h)
    // Base emissions reduced by capture efficiency
    const baseEmissions = 1000; // ton/h
    kpis.CO2_emissions = baseEmissions * (1 - achievedCapture);

    return kpis;
  }

  private evaluateSpecs(project: JasperProject, kpis: Record<string, number>): any[] {
    const specResults: any[] = [];
    const achievedCapture = kpis.achievedCapture || 0;
    const totalStages = kpis.totalStages || 0;
    const circulationRate = kpis.circulationRate || 0;

    for (const spec of project.specs.specs) {
      if (spec.type === 'capture') {
        specResults.push({
          specId: spec.id,
          achieved: achievedCapture,
          target: spec.targetRemoval,
          ok: achievedCapture >= spec.targetRemoval,
        });
      } else if (spec.type === 'purity') {
        const purity = Math.min(0.99, 0.7 + (totalStages / 100) * 0.25 + (circulationRate / 1000) * 0.1);
        specResults.push({
          specId: spec.id,
          achieved: purity,
          target: spec.target,
          ok: purity >= spec.target,
        });
      } else if (spec.type === 'recovery') {
        const recovery = Math.min(0.99, 0.6 + (totalStages / 80) * 0.3);
        specResults.push({
          specId: spec.id,
          achieved: recovery,
          target: spec.target,
          ok: recovery >= spec.target,
        });
      }
    }

    return specResults;
  }

  private evaluateConstraints(project: JasperProject, kpis: Record<string, number>): any[] {
    const violations: any[] = [];

    for (const constraint of project.constraints.constraints) {
      const value = evaluateMetricRef(constraint.ref, project, {
        runId: '',
        projectId: project.projectId,
        versionId: '',
        createdAt: '',
        simulator: this.name,
        status: 'done',
        inputsHash: '',
        converged: true,
        kpis,
        specResults: [],
        violations: [],
      } as any);

      if (value === null) continue;

      let violated = false;
      let message = '';

      if (constraint.type === 'max') {
        violated = value > constraint.limit;
        if (violated) {
          message = `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} = ${value.toFixed(2)} exceeds max limit ${constraint.limit}`;
        }
      } else if (constraint.type === 'min') {
        violated = value < constraint.limit;
        if (violated) {
          message = `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} = ${value.toFixed(2)} below min limit ${constraint.limit}`;
        }
      } else if (constraint.type === 'range') {
        violated = value < constraint.min || value > constraint.max;
        if (violated) {
          message = `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} = ${value.toFixed(2)} outside range [${constraint.min}, ${constraint.max}]`;
        }
      }

      if (violated) {
        violations.push({
          constraintId: constraint.id,
          value,
          message,
          hard: constraint.hard,
        });
      }
    }

    return violations;
  }
}

/**
 * Factory function to get simulation engine
 * Can be extended to return different engines based on configuration
 */
export function getSimulationEngine(): SimulationEngine {
  return new EnhancedJasperSim();
}

/**
 * Future: Integration with DWSIM via API
 * 
 * export class DWSIMEngine implements SimulationEngine {
 *   name = 'dwsim';
 *   
 *   async run(project: JasperProject, versionId: string): Promise<...> {
 *     // Call DWSIM API or backend service
 *     const response = await fetch('/api/dwsim/simulate', {
 *       method: 'POST',
 *       body: JSON.stringify(project),
 *     });
 *     return response.json();
 *   }
 * }
 */

