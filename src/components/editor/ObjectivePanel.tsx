import type { JasperProject } from '../../core/schema';

interface ObjectivePanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
}

export default function ObjectivePanel({ project, onProjectChange }: ObjectivePanelProps) {
  const updateObjective = (updates: Partial<typeof project.objective>) => {
    onProjectChange({
      ...project,
      objective: { ...project.objective, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Objective Metric</label>
        <select
          value={project.objective.metric}
          onChange={(e) => updateObjective({ metric: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="steam">Steam</option>
          <option value="electricity">Electricity</option>
          <option value="COM">COM (Cost of Manufacturing)</option>
          <option value="CAPEX_proxy">CAPEX Proxy</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sense</label>
        <select
          value={project.objective.sense}
          onChange={(e) => updateObjective({ sense: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="min">Minimize</option>
          <option value="max">Maximize</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (optional)</label>
        <input
          type="number"
          value={project.objective.weight || ''}
          onChange={(e) =>
            updateObjective({ weight: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1.0"
        />
      </div>
    </div>
  );
}

