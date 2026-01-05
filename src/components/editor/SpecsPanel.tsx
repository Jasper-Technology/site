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
        <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </button>
      </div>

      {showAdd && (
        <div className="p-3 bg-gray-50 rounded border border-gray-200">
          <select
            value={specType}
            onChange={(e) => setSpecType(e.target.value as any)}
            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="purity">Purity</option>
            <option value="recovery">Recovery</option>
            <option value="capture">Capture</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={addSpec}
              className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {project.specs.specs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No specs defined</p>
        ) : (
          project.specs.specs.map((spec) => {
            const result = getSpecResult(spec.id);
            return (
              <div
                key={spec.id}
                className="p-3 border border-gray-200 rounded flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {spec.type === 'purity' && `Purity: ${spec.component} ≥ ${spec.target}`}
                    {spec.type === 'recovery' && `Recovery: ${spec.component} ≥ ${spec.target}`}
                    {spec.type === 'capture' && `Capture: ${spec.component} ≥ ${spec.targetRemoval}`}
                  </div>
                  {result && (
                    <div className="mt-1 text-xs">
                      <span className={result.ok ? 'text-green-600' : 'text-red-600'}>
                        Achieved: {result.achieved.toFixed(3)} / Target: {result.target}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeSpec(spec.id)}
                  className="ml-2 text-gray-400 hover:text-red-600"
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

