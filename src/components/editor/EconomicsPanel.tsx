import type { JasperProject } from '../../core/schema';

interface EconomicsPanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
}

export default function EconomicsPanel({ project, onProjectChange }: EconomicsPanelProps) {
  const economics = project.economics || {};

  const updateEconomics = (updates: Partial<typeof economics>) => {
    onProjectChange({
      ...project,
      economics: { ...economics, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Steam Price ($/GJ)</label>
        <input
          type="number"
          value={economics.steamPrice || ''}
          onChange={(e) =>
            updateEconomics({ steamPrice: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          className="input"
          placeholder="10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Electricity Price ($/kWh)
        </label>
        <input
          type="number"
          value={economics.electricityPrice || ''}
          onChange={(e) =>
            updateEconomics({
              electricityPrice: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          className="input"
          placeholder="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CO2 Price ($/ton)</label>
        <input
          type="number"
          value={economics.co2Price || ''}
          onChange={(e) =>
            updateEconomics({ co2Price: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          className="input"
          placeholder="50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CAPEX Factor</label>
        <input
          type="number"
          value={economics.capexFactor || ''}
          onChange={(e) =>
            updateEconomics({
              capexFactor: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          className="input"
          placeholder="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
        <textarea
          value={economics.notes || ''}
          onChange={(e) => updateEconomics({ notes: e.target.value })}
          className="input resize-none"
          rows={3}
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );
}

