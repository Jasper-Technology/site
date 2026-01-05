import type { MetricRef, JasperProject, SimulationRun } from './schema';

export function evaluateMetricRef(
  ref: MetricRef,
  project: JasperProject,
  run?: SimulationRun
): number | null {
  switch (ref.kind) {
    case 'stream': {
      const stream = project.flowsheet.edges.find(e => e.id === ref.streamId);
      if (!stream?.spec) return null;
      
      switch (ref.metric) {
        case 'T':
          return stream.spec.T?.value ?? null;
        case 'P':
          return stream.spec.P?.value ?? null;
        case 'flow':
          return stream.spec.flow?.value ?? null;
        case 'vaporFrac':
          // Stub - would compute from phase
          return stream.spec.phase === 'V' ? 1 : stream.spec.phase === 'L' ? 0 : null;
        default:
          return null;
      }
    }
    case 'unit': {
      const node = project.flowsheet.nodes.find(n => n.id === ref.nodeId);
      if (!node) return null;
      
      const param = node.params[ref.metric] as any;
      if (param?.kind === 'number') return param.x;
      if (param?.kind === 'quantity') return param.q.value;
      if (param?.kind === 'int') return param.n;
      return null;
    }
    case 'kpi': {
      if (!run) return null;
      const metricValue = run.kpis[ref.metric];
      return typeof metricValue === 'number' ? metricValue : null;
    }
    default:
      return null;
  }
}

