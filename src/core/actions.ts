import type { JasperProject, JasperAction } from './schema';

export function applyAction(project: JasperProject, action: JasperAction): JasperProject {
  const updated = { ...project };

  switch (action.type) {
    case 'SET_PARAM': {
      const node = updated.flowsheet.nodes.find(n => n.id === action.nodeId);
      if (node) {
        node.params = { ...node.params, [action.key]: action.value };
      }
      break;
    }
    case 'SET_STREAM_SPEC': {
      const edge = updated.flowsheet.edges.find(e => e.id === action.streamId);
      if (edge) {
        edge.spec = { ...edge.spec, ...action.spec };
      }
      break;
    }
    case 'ADD_NODE': {
      updated.flowsheet.nodes = [...updated.flowsheet.nodes, action.node];
      break;
    }
    case 'REMOVE_NODE': {
      updated.flowsheet.nodes = updated.flowsheet.nodes.filter(n => n.id !== action.nodeId);
      updated.flowsheet.edges = updated.flowsheet.edges.filter(
        e => e.from.nodeId !== action.nodeId && e.to.nodeId !== action.nodeId
      );
      break;
    }
    case 'ADD_STREAM': {
      updated.flowsheet.edges = [...updated.flowsheet.edges, action.edge];
      break;
    }
    case 'REMOVE_STREAM': {
      updated.flowsheet.edges = updated.flowsheet.edges.filter(e => e.id !== action.streamId);
      break;
    }
    case 'REWIRE_STREAM': {
      const edge = updated.flowsheet.edges.find(e => e.id === action.streamId);
      if (edge) {
        if (action.from) {
          edge.from = action.from;
        }
        if (action.to) {
          edge.to = action.to;
        }
      }
      break;
    }
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
}

