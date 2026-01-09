import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../data/api';
import { generateId } from '../../core/ids';
import type { JasperProject, Spec } from '../../core/schema';

interface SpecsPanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
  latestRunId: string | null;
}

export default function SpecsPanel({ project, onProjectChange, latestRunId }: SpecsPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [specType, setSpecType] = useState<'purity' | 'recovery' | 'capture'>('purity');

  const { data: run } = useQuery({
    queryKey: ['run', latestRunId],
    queryFn: () => (latestRunId ? api.getRun(latestRunId) : null),
    enabled: !!latestRunId,
  });

  const addSpec = () => {
    let newSpec: Spec;
    if (specType === 'purity') {
      newSpec = {
        id: generateId('spec'),
        type: 'purity',
        streamId: project.flowsheet.edges[0]?.id || '',
        component: 'CO2',
        target: 0.95,
      };
    } else if (specType === 'recovery') {
      newSpec = {
        id: generateId('spec'),
        type: 'recovery',
        component: 'CO2',
        feedStreamId: project.flowsheet.edges[0]?.id || '',
        productStreamId: project.flowsheet.edges[1]?.id || '',
        target: 0.9,
      };
    } else {
      newSpec = {
        id: generateId('spec'),
        type: 'capture',
        component: 'CO2',
        ventStreamId: project.flowsheet.edges[0]?.id || '',
        targetRemoval: 0.9,
      };
    }

    onProjectChange({
      ...project,
      specs: {
        specs: [...project.specs.specs, newSpec],
      },
    });
    setShowAdd(false);
  };

  const removeSpec = (specId: string) => {
    onProjectChange({
      ...project,
      specs: {
        specs: project.specs.specs.filter((s) => s.id !== specId),
      },
    });
  };

  const getSpecResult = (specId: string) => {
    return run?.specResults.find((sr) => sr.specId === specId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Specifications</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </button>
      </div>

      {showAdd && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <select
            value={specType}
            onChange={(e) => setSpecType(e.target.value as any)}
            className="input-sm w-full mb-2"
          >
            <option value="purity">Purity</option>
            <option value="recovery">Recovery</option>
            <option value="capture">Capture</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={addSpec}
              className="flex-1 px-3 py-1.5 text-sm bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {project.specs.specs.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No specs defined</p>
        ) : (
          project.specs.specs.map((spec) => {
            const result = getSpecResult(spec.id);
            return (
              <div
                key={spec.id}
                className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {spec.type === 'purity' && `Purity: ${spec.component} ≥ ${spec.target}`}
                    {spec.type === 'recovery' && `Recovery: ${spec.component} ≥ ${spec.target}`}
                    {spec.type === 'capture' && `Capture: ${spec.component} ≥ ${spec.targetRemoval}`}
                  </div>
                  {result && (
                    <div className="mt-1 text-xs">
                      <span className={result.ok ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                        Achieved: {result.achieved.toFixed(3)} / Target: {result.target}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeSpec(spec.id)}
                  className="ml-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

