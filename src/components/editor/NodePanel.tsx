import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { JasperProject, ParamValue } from '../../core/schema';

interface NodePanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
  nodeId: string | null;
  onOpenComponentPicker?: () => void;
}

export default function NodePanel({ project, onProjectChange, nodeId, onOpenComponentPicker }: NodePanelProps) {
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
    const textParam = node.params.text;
    const textContent = (textParam && 'kind' in textParam && textParam.kind === 'string') ? textParam.s : '';
    
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

  // Special handling for Feed blocks - show T, P, flow, composition nicely
  if (node.type === 'Feed') {
    const components = project.components || [];
    const TParam = node.params.T as { kind: 'quantity'; q: { value: number; unit: string } } | undefined;
    const PParam = node.params.P as { kind: 'quantity'; q: { value: number; unit: string } } | undefined;
    const flowParam = node.params.flow as { kind: 'quantity'; q: { value: number; unit: string } } | undefined;
    const compositionParam = node.params.composition as { kind: 'composition'; comp: Record<string, number> } | undefined;

    const updateFeedParam = (key: string, value: number, unit: string) => {
      updateParam(key, { kind: 'quantity', q: { value, unit } });
    };

    const updateComposition = (compId: string, fraction: number) => {
      const currentComp = compositionParam?.comp || {};
      updateParam('composition', {
        kind: 'composition',
        comp: { ...currentComp, [compId]: fraction },
      });
    };

    const compositionTotal = compositionParam?.comp
      ? Object.values(compositionParam.comp).reduce((sum, val) => sum + (val || 0), 0)
      : 0;

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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temperature</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={TParam?.q.value ?? 25}
              onChange={(e) => updateFeedParam('T', parseFloat(e.target.value) || 0, TParam?.q.unit || 'C')}
              className="input flex-1"
            />
            <select
              value={TParam?.q.unit || 'C'}
              onChange={(e) => updateFeedParam('T', TParam?.q.value ?? 25, e.target.value)}
              className="input w-20"
            >
              <option value="C">°C</option>
              <option value="K">K</option>
              <option value="F">°F</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pressure</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={PParam?.q.value ?? 1}
              onChange={(e) => updateFeedParam('P', parseFloat(e.target.value) || 0, PParam?.q.unit || 'bar')}
              className="input flex-1"
            />
            <select
              value={PParam?.q.unit || 'bar'}
              onChange={(e) => updateFeedParam('P', PParam?.q.value ?? 1, e.target.value)}
              className="input w-20"
            >
              <option value="bar">bar</option>
              <option value="Pa">Pa</option>
              <option value="psi">psi</option>
              <option value="atm">atm</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Flow Rate</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={flowParam?.q.value ?? 100}
              onChange={(e) => updateFeedParam('flow', parseFloat(e.target.value) || 0, flowParam?.q.unit || 'kmol/h')}
              className="input flex-1"
            />
            <select
              value={flowParam?.q.unit || 'kmol/h'}
              onChange={(e) => updateFeedParam('flow', flowParam?.q.value ?? 100, e.target.value)}
              className="input w-28"
            >
              <option value="kmol/h">kmol/h</option>
              <option value="kg/h">kg/h</option>
              <option value="mol/s">mol/s</option>
            </select>
          </div>
        </div>

        {/* Composition Section */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Composition (Mole Fraction)
            </label>
            {compositionTotal > 0 && (
              <span className={`text-xs ${Math.abs(compositionTotal - 1.0) < 0.01 ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'}`}>
                Total: {compositionTotal.toFixed(3)}
              </span>
            )}
          </div>

          {components.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No components defined in project
              </p>
              {onOpenComponentPicker && (
                <button
                  onClick={onOpenComponentPicker}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Components
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {components.map((comp) => {
                const value = compositionParam?.comp?.[comp.id] || 0;
                return (
                  <div key={comp.id} className="flex items-center space-x-2">
                    <span className="text-sm text-slate-700 dark:text-slate-300 w-20 truncate" title={`${comp.name} (${comp.id})`}>
                      {comp.id}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={value ? value.toFixed(4) : ''}
                      onChange={(e) => updateComposition(comp.id, parseFloat(e.target.value) || 0)}
                      className="input-sm flex-1"
                      placeholder="0.0"
                    />
                  </div>
                );
              })}
              {onOpenComponentPicker && (
                <button
                  onClick={onOpenComponentPicker}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add more components
                </button>
              )}
            </div>
          )}
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

