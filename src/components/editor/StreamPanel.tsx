import { useMemo } from 'react';
import type { JasperProject, StreamSpec } from '../../core/schema';

interface StreamPanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
  streamId: string | null;
}

export default function StreamPanel({ project, onProjectChange, streamId }: StreamPanelProps) {
  const stream = useMemo(
    () => project.flowsheet.edges.find((e) => e.id === streamId),
    [project, streamId]
  );

  if (!streamId || !stream) {
    return (
      <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
        {streamId ? 'Stream not found' : 'Select a stream to edit its properties'}
      </div>
    );
  }

  const updateSpec = (spec: Partial<StreamSpec>) => {
    const updatedEdges = project.flowsheet.edges.map((e) =>
      e.id === streamId ? { ...e, spec: { ...e.spec, ...spec } } : e
    );
    onProjectChange({
      ...project,
      flowsheet: { ...project.flowsheet, edges: updatedEdges },
    });
  };

  const updateName = (name: string) => {
    const updatedEdges = project.flowsheet.edges.map((e) =>
      e.id === streamId ? { ...e, name } : e
    );
    onProjectChange({
      ...project,
      flowsheet: { ...project.flowsheet, edges: updatedEdges },
    });
  };

  const updateComposition = (component: string, fraction: number) => {
    const newComposition = { ...(stream.spec?.composition || {}), [component]: fraction };
    updateSpec({ composition: newComposition });
  };

  const components = project.components || [];
  const composition = stream.spec?.composition || {};
  const total = Object.values(composition).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
        <input
          type="text"
          value={stream.name}
          onChange={(e) => updateName(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Flow Rate</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={stream.spec?.flow?.value || ''}
            onChange={(e) =>
              updateSpec({
                flow: {
                  value: parseFloat(e.target.value) || 0,
                  unit: stream.spec?.flow?.unit || 'kmol/h',
                },
              })
            }
            className="input flex-1"
            placeholder="Flow rate"
          />
          <select
            value={stream.spec?.flow?.unit || 'kmol/h'}
            onChange={(e) =>
              updateSpec({
                flow: { value: stream.spec?.flow?.value || 0, unit: e.target.value },
              })
            }
            className="input w-28"
          >
            <option value="kmol/h">kmol/h</option>
            <option value="kg/h">kg/h</option>
            <option value="m3/h">m³/h</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temperature</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={stream.spec?.T?.value || ''}
            onChange={(e) =>
              updateSpec({
                T: { value: parseFloat(e.target.value) || 0, unit: stream.spec?.T?.unit || 'C' },
              })
            }
            className="input flex-1"
            placeholder="Temperature"
          />
          <select
            value={stream.spec?.T?.unit || 'C'}
            onChange={(e) =>
              updateSpec({
                T: { value: stream.spec?.T?.value || 0, unit: e.target.value },
              })
            }
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
            value={stream.spec?.P?.value || ''}
            onChange={(e) =>
              updateSpec({
                P: { value: parseFloat(e.target.value) || 0, unit: stream.spec?.P?.unit || 'bar' },
              })
            }
            className="input flex-1"
            placeholder="Pressure"
          />
          <select
            value={stream.spec?.P?.unit || 'bar'}
            onChange={(e) =>
              updateSpec({
                P: { value: stream.spec?.P?.value || 0, unit: e.target.value },
              })
            }
            className="input w-20"
          >
            <option value="bar">bar</option>
            <option value="Pa">Pa</option>
            <option value="psi">psi</option>
          </select>
        </div>
      </div>

      {/* Composition Section */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Composition (Mole Fraction)
          </label>
          {total > 0 && (
            <span className={`text-xs ${Math.abs(total - 1.0) < 0.01 ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'}`}>
              Total: {total.toFixed(3)}
            </span>
          )}
        </div>
        
        {components.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No components defined in project
          </p>
        ) : (
          <div className="space-y-2">
            {components.map((comp) => (
              <div key={comp.id} className="flex items-center space-x-2">
                <span className="text-sm text-slate-700 dark:text-slate-300 w-20 truncate" title={comp.name}>
                  {comp.name}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={composition[comp.name] || ''}
                  onChange={(e) => updateComposition(comp.name, parseFloat(e.target.value) || 0)}
                  className="input-sm flex-1"
                  placeholder="0.0"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

