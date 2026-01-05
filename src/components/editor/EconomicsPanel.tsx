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
        <label className="block text-sm font-medium text-gray-700 mb-1">Steam Price ($/GJ)</label>
        <input
          type="number"
          value={economics.steamPrice || ''}
          onChange={(e) =>
            updateEconomics({ steamPrice: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CO2 Price ($/ton)</label>
        <input
          type="number"
          value={economics.co2Price || ''}
          onChange={(e) =>
            updateEconomics({ co2Price: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX Factor</label>
        <input
          type="number"
          value={economics.capexFactor || ''}
          onChange={(e) =>
            updateEconomics({
              capexFactor: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={economics.notes || ''}
          onChange={(e) => updateEconomics({ notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );
}

