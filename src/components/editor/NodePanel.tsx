import { useMemo } from 'react';
import type { JasperProject, ParamValue } from '../../core/schema';

interface NodePanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
  nodeId: string | null;
}

export default function NodePanel({ project, onProjectChange, nodeId }: NodePanelProps) {
  const node = useMemo(
    () => project.flowsheet.nodes.find((n) => n.id === nodeId),
    [project, nodeId]
  );

  if (!node) {
    return (
      <div className="text-sm text-slate-400 text-center py-8">
        Select a node to edit its properties
      </div>
    );
  }

  const updateParam = (key: string, value: ParamValue) => {
    const updatedNodes = project.flowsheet.nodes.map((n) => {
      if (n.id === nodeId) {
        const updatedParams = { ...n.params };
        updatedParams[key] = value;
        return { ...n, params: updatedParams };
      }
      return n;
    });
    onProjectChange({
      ...project,
      flowsheet: { ...project.flowsheet, nodes: updatedNodes },
    });
  };

  const updateName = (name: string) => {
    const updatedNodes = project.flowsheet.nodes.map((n) =>
      n.id === nodeId ? { ...n, name } : n
    );
    onProjectChange({
      ...project,
      flowsheet: { ...project.flowsheet, nodes: updatedNodes },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
        <input
          type="text"
          value={node.name}
          onChange={(e) => updateName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
        <div className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-slate-300">
          {node.type}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Parameters</label>
        <div className="space-y-2">
          {Object.entries(node.params).map(([key, param]) => {
            const typedParam = param as ParamValue;
            return (
              <div key={key} className="flex items-center space-x-2">
                <span className="text-sm text-slate-400 w-24">{key}:</span>
                {typedParam.kind === 'quantity' && (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="number"
                      value={typedParam.q.value}
                      onChange={(e) =>
                        updateParam(key, {
                          kind: 'quantity',
                          q: { value: parseFloat(e.target.value) || 0, unit: typedParam.q.unit },
                        })
                      }
                      className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 text-slate-100 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={typedParam.q.unit}
                      onChange={(e) =>
                        updateParam(key, {
                          kind: 'quantity',
                          q: { value: typedParam.q.value, unit: e.target.value },
                        })
                      }
                      className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 text-slate-100 rounded text-sm"
                    />
                  </div>
                )}
                {typedParam.kind === 'number' && (
                  <input
                    type="number"
                    value={typedParam.x}
                    onChange={(e) =>
                      updateParam(key, { kind: 'number', x: parseFloat(e.target.value) || 0 })
                    }
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
                {typedParam.kind === 'int' && (
                  <input
                    type="number"
                    value={typedParam.n}
                    onChange={(e) =>
                      updateParam(key, { kind: 'int', n: parseInt(e.target.value) || 0 })
                    }
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Ports</label>
        <div className="space-y-1">
          {node.ports.map((port) => (
            <div key={port.id} className="text-sm text-slate-300 px-2 py-1 bg-slate-700 rounded">
              {port.name} ({port.direction})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

