import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../data/api';
import { generateId } from '../../core/ids';
import type { JasperProject, Constraint, MetricRef } from '../../core/schema';

interface ConstraintsPanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
  latestRunId: string | null;
}

export default function ConstraintsPanel({
  project,
  onProjectChange,
  latestRunId,
}: ConstraintsPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [constraintType, setConstraintType] = useState<'max' | 'min' | 'range'>('max');
  const [metricKind, setMetricKind] = useState<'kpi' | 'stream' | 'unit'>('kpi');
  const [metric, setMetric] = useState('steam');
  const [limit, setLimit] = useState(1000);
  const [minLimit, setMinLimit] = useState(0);
  const [maxLimit, setMaxLimit] = useState(1000);

  const { data: run } = useQuery({
    queryKey: ['run', latestRunId],
    queryFn: () => (latestRunId ? api.getRun(latestRunId) : null),
    enabled: !!latestRunId,
  });

  const addConstraint = () => {
    let ref: MetricRef;
    if (metricKind === 'kpi') {
      ref = { kind: 'kpi', metric: metric as any };
    } else if (metricKind === 'stream') {
      ref = {
        kind: 'stream',
        streamId: project.flowsheet.edges[0]?.id || '',
        metric: metric as any,
      };
    } else {
      ref = {
        kind: 'unit',
        nodeId: project.flowsheet.nodes[0]?.id || '',
        metric: metric as any,
      };
    }

    let newConstraint: Constraint;
    if (constraintType === 'max') {
      newConstraint = {
        id: generateId('constraint'),
        type: 'max',
        ref,
        limit,
        hard: true,
      };
    } else if (constraintType === 'min') {
      newConstraint = {
        id: generateId('constraint'),
        type: 'min',
        ref,
        limit,
        hard: true,
      };
    } else {
      newConstraint = {
        id: generateId('constraint'),
        type: 'range',
        ref,
        min: minLimit,
        max: maxLimit,
        hard: true,
      };
    }

    onProjectChange({
      ...project,
      constraints: {
        constraints: [...project.constraints.constraints, newConstraint],
      },
    });
    setShowAdd(false);
  };

  const removeConstraint = (constraintId: string) => {
    onProjectChange({
      ...project,
      constraints: {
        constraints: project.constraints.constraints.filter((c) => c.id !== constraintId),
      },
    });
  };

  const getViolation = (constraintId: string) => {
    return run?.violations.find((v) => v.constraintId === constraintId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900">Constraints</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </button>
      </div>

      {showAdd && (
        <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
          <select
            value={constraintType}
            onChange={(e) => setConstraintType(e.target.value as any)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="max">Max</option>
            <option value="min">Min</option>
            <option value="range">Range</option>
          </select>
          <select
            value={metricKind}
            onChange={(e) => setMetricKind(e.target.value as any)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="kpi">KPI</option>
            <option value="stream">Stream</option>
            <option value="unit">Unit</option>
          </select>
          <input
            type="text"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="Metric name"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
          {constraintType === 'range' ? (
            <div className="flex space-x-2">
              <input
                type="number"
                value={minLimit}
                onChange={(e) => setMinLimit(parseFloat(e.target.value) || 0)}
                placeholder="Min"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <input
                type="number"
                value={maxLimit}
                onChange={(e) => setMaxLimit(parseFloat(e.target.value) || 0)}
                placeholder="Max"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          ) : (
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseFloat(e.target.value) || 0)}
              placeholder="Limit"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          )}
          <div className="flex space-x-2">
            <button
              onClick={addConstraint}
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
        {project.constraints.constraints.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No constraints defined</p>
        ) : (
          project.constraints.constraints.map((constraint) => {
            const violation = getViolation(constraint.id);
            return (
              <div
                key={constraint.id}
                className={`p-3 border rounded flex items-start justify-between ${
                  violation ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {constraint.type === 'max' &&
                      `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} ≤ ${constraint.limit}`}
                    {constraint.type === 'min' &&
                      `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} ≥ ${constraint.limit}`}
                    {constraint.type === 'range' &&
                      `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} ∈ [${constraint.min}, ${constraint.max}]`}
                  </div>
                  {violation && (
                    <div className="mt-1 text-xs text-red-600">{violation.message}</div>
                  )}
                </div>
                <button
                  onClick={() => removeConstraint(constraint.id)}
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

