import type { JasperProject, SimulationRun } from '../core/schema';
import { getSimulationEngine } from './engine';

/**
 * Main simulation entry point
 * Delegates to the configured simulation engine
 */
export async function runSimulation(
  project: JasperProject,
  versionId: string
): Promise<Omit<SimulationRun, 'runId' | 'projectId' | 'versionId' | 'createdAt'>> {
  const engine = getSimulationEngine();
  return engine.run(project, versionId);
}
