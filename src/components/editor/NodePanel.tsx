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

  if (!nodeId || !node) {
    return (
      <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
        Select a unit to edit its properties
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

  // Special handling for TextBox nodes
  if (node.type === 'TextBox') {
    const textContent = node.params.text?.s || '';
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Text Content</label>
          <textarea
            value={textContent}
            onChange={(e) => updateParam('text', { kind: 'string', s: e.target.value })}
            className="input resize-none"
            rows={6}
            placeholder="Enter annotation text..."
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Add notes, labels, or comments to your flowsheet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
        <input
          type="text"
          value={node.name}
          onChange={(e) => updateName(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
        <div className="input cursor-default">
          {node.type}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Parameters</label>
        <div className="space-y-2">
          {Object.entries(node.params).map(([key, param]) => {
            const typedParam = param as ParamValue;
            return (
              <div key={key} className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{key}:</span>
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
                      className="flex-1 input-sm"
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
                      className="w-20 input-sm"
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
                    className="flex-1 input-sm"
                  />
                )}
                {typedParam.kind === 'int' && (
                  <input
                    type="number"
                    value={typedParam.n}
                    onChange={(e) =>
                      updateParam(key, { kind: 'int', n: parseInt(e.target.value) || 0 })
                    }
                    className="flex-1 input-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ports</label>
        <div className="space-y-1">
          {node.ports.map((port) => (
            <div key={port.id} className="text-sm text-slate-700 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded">
              {port.name} ({port.direction})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

