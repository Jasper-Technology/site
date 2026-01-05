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

  if (!stream) {
    return (
      <div className="text-sm text-slate-500 text-center py-8">
        Select a stream to edit its properties
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
        <input
          type="text"
          value={stream.name}
          onChange={(e) => updateName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Temperature</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={stream.spec?.T?.value || ''}
            onChange={(e) =>
              updateSpec({
                T: { value: parseFloat(e.target.value) || 0, unit: stream.spec?.T?.unit || 'C' },
              })
            }
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm"
            placeholder="Temperature"
          />
          <input
            type="text"
            value={stream.spec?.T?.unit || 'C'}
            onChange={(e) =>
              updateSpec({
                T: { value: stream.spec?.T?.value || 0, unit: e.target.value },
              })
            }
            className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pressure</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={stream.spec?.P?.value || ''}
            onChange={(e) =>
              updateSpec({
                P: { value: parseFloat(e.target.value) || 0, unit: stream.spec?.P?.unit || 'bar' },
              })
            }
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm"
            placeholder="Pressure"
          />
          <input
            type="text"
            value={stream.spec?.P?.unit || 'bar'}
            onChange={(e) =>
              updateSpec({
                P: { value: stream.spec?.P?.value || 0, unit: e.target.value },
              })
            }
            className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Flow</label>
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
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm"
            placeholder="Flow"
          />
          <input
            type="text"
            value={stream.spec?.flow?.unit || 'kmol/h'}
            onChange={(e) =>
              updateSpec({
                flow: { value: stream.spec?.flow?.value || 0, unit: e.target.value },
              })
            }
            className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
}

