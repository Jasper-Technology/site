import type { SimulationRun, JasperProject, JasperAction, ParamValue } from '../core/schema';

export function suggestFix(
  project: JasperProject,
  run: SimulationRun
): JasperAction[] {
  const suggestions: JasperAction[] = [];

  // Simple heuristic: if steam is too high, suggest increasing stripper pressure
  const steamViolation = run.violations.find(v => {
    // Would need to check constraint ref, simplified here
    return v.message.includes('steam');
  });

  const steamValue = typeof run.kpis.steam === 'number' ? run.kpis.steam : 0;
  if (steamViolation && steamValue > 1000) {
    const stripper = project.flowsheet.nodes.find(n => n.type === 'Stripper');
    if (stripper) {
      const currentP = stripper.params.P as ParamValue | undefined;
      let newP = 2;
      if (currentP?.kind === 'quantity') {
        newP = currentP.q.value * 1.2; // Increase by 20%
      }
      suggestions.push({
        type: 'SET_PARAM',
        nodeId: stripper.id,
        key: 'P',
        value: { kind: 'quantity', q: { value: Math.min(newP, 5), unit: 'bar' } },
      });
    }
  }

  // If capture is low, suggest increasing stages
  const captureSpec = run.specResults.find(sr => !sr.ok);
  if (captureSpec) {
    const absorber = project.flowsheet.nodes.find(n => n.type === 'Absorber');
    if (absorber) {
      const currentStages = absorber.params.stages as ParamValue | undefined;
      let newStages = 20;
      if (currentStages?.kind === 'int') {
        newStages = currentStages.n + 5;
      } else if (currentStages?.kind === 'number') {
        newStages = Math.floor(currentStages.x) + 5;
      }
      suggestions.push({
        type: 'SET_PARAM',
        nodeId: absorber.id,
        key: 'stages',
        value: { kind: 'int', n: Math.min(newStages, 50) },
      });
    }
  }

  return suggestions.slice(0, 2); // Return max 2 suggestions
}

