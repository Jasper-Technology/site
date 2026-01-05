import type { SimulationRun, EconomicConfig } from '../core/schema';

export function computeCOM(run: SimulationRun, economics?: EconomicConfig): number {
  const steam = (typeof run.kpis.steam === 'number' ? run.kpis.steam : 0);
  const electricity = (typeof run.kpis.electricity === 'number' ? run.kpis.electricity : 0);
  const co2Emissions = (typeof run.kpis.CO2_emissions === 'number' ? run.kpis.CO2_emissions : 0);
  const capexProxy = (typeof run.kpis.CAPEX_proxy === 'number' ? run.kpis.CAPEX_proxy : 0);

  const steamPrice = economics?.steamPrice || 10; // $/GJ
  const electricityPrice = economics?.electricityPrice || 0.1; // $/kWh
  const co2Price = economics?.co2Price || 50; // $/ton
  const capexFactor = economics?.capexFactor || 0.1;

  return (
    steam * steamPrice +
    electricity * electricityPrice +
    co2Emissions * co2Price +
    capexProxy * capexFactor
  );
}

