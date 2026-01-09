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
        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Constraints</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </button>
      </div>

      {showAdd && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
          <select
            value={constraintType}
            onChange={(e) => setConstraintType(e.target.value as any)}
            className="input-sm w-full"
          >
            <option value="max">Max</option>
            <option value="min">Min</option>
            <option value="range">Range</option>
          </select>
          <select
            value={metricKind}
            onChange={(e) => setMetricKind(e.target.value as any)}
            className="input-sm w-full"
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
            className="input-sm w-full"
          />
          {constraintType === 'range' ? (
            <div className="flex space-x-2">
              <input
                type="number"
                value={minLimit}
                onChange={(e) => setMinLimit(parseFloat(e.target.value) || 0)}
                placeholder="Min"
                className="input-sm flex-1"
              />
              <input
                type="number"
                value={maxLimit}
                onChange={(e) => setMaxLimit(parseFloat(e.target.value) || 0)}
                placeholder="Max"
                className="input-sm flex-1"
              />
            </div>
          ) : (
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseFloat(e.target.value) || 0)}
              placeholder="Limit"
              className="input-sm w-full"
            />
          )}
          <div className="flex space-x-2">
            <button
              onClick={addConstraint}
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
        {project.constraints.constraints.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No constraints defined</p>
        ) : (
          project.constraints.constraints.map((constraint) => {
            const violation = getViolation(constraint.id);
            return (
              <div
                key={constraint.id}
                className={`p-3 border rounded-lg flex items-start justify-between ${
                  violation ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {constraint.type === 'max' &&
                      `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} ≤ ${constraint.limit}`}
                    {constraint.type === 'min' &&
                      `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} ≥ ${constraint.limit}`}
                    {constraint.type === 'range' &&
                      `${constraint.ref.kind === 'kpi' ? constraint.ref.metric : 'metric'} ∈ [${constraint.min}, ${constraint.max}]`}
                  </div>
                  {violation && (
                    <div className="mt-1 text-xs text-red-600 dark:text-red-500">{violation.message}</div>
                  )}
                </div>
                <button
                  onClick={() => removeConstraint(constraint.id)}
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

