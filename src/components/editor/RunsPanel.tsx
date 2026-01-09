import { useQuery } from '@tanstack/react-query';
import { api } from '../../data/api';
import { CheckCircle, XCircle } from 'lucide-react';

interface RunsPanelProps {
  projectId: string;
}

export default function RunsPanel({ projectId }: RunsPanelProps) {
  const { data: runs = [] } = useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => api.listRuns(projectId),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      {runs.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No runs yet</p>
      ) : (
        runs.map((run) => (
          <div
            key={run.runId}
            className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {run.converged ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                )}
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(run.createdAt)}
                </span>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  run.status === 'done'
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-500'
                    : run.status === 'error'
                      ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-500'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {run.status}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>Violations: {run.violations.length}</div>
              <div className="flex space-x-4">
                {typeof run.kpis.COM === 'number' && <div>COM: ${run.kpis.COM.toFixed(2)}</div>}
                {typeof run.kpis.steam === 'number' && <div>Steam: {run.kpis.steam.toFixed(1)} GJ</div>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

