/**
 * Thermodynamic Property Calculations
 * 
 * This module provides basic thermodynamic property calculations.
 * For production use, integrate with libraries like:
 * - CoolProp (via WASM)
 * - Cantera
 * - DWSIM's thermodynamics engine
 */

export interface Component {
  name: string;
  MW: number;           // Molecular weight (g/mol)
  Tc: number;           // Critical temperature (K)
  Pc: number;           // Critical pressure (bar)
  omega: number;        // Acentric factor
  Tb: number;           // Normal boiling point (K)
  Hf: number;           // Heat of formation (kJ/mol)
  Cp_coef: number[];    // Heat capacity coefficients [a, b, c, d, e] for Cp = a + bT + cT^2 + dT^3 + eT^4
}

/**
 * Common component database
 * Data from DIPPR, NIST, and other sources
 */
export const COMPONENT_DATABASE: Record<string, Component> = {
  'H2O': {
    name: 'Water',
    MW: 18.015,
    Tc: 647.1,
    Pc: 220.64,
    omega: 0.345,
    Tb: 373.15,
    Hf: -241.8,
    Cp_coef: [33.46, 0.00688, 7.604e-6, -3.593e-9, 0], // J/mol/K
  },
  'CO2': {
    name: 'Carbon Dioxide',
    MW: 44.01,
    Tc: 304.13,
    Pc: 73.77,
    omega: 0.228,
    Tb: 194.65, // sublimation point at 1 atm
    Hf: -393.5,
    Cp_coef: [19.8, 0.07344, -5.602e-5, 1.715e-8, 0],
  },
  'N2': {
    name: 'Nitrogen',
    MW: 28.014,
    Tc: 126.2,
    Pc: 33.96,
    omega: 0.037,
    Tb: 77.35,
    Hf: 0.0,
    Cp_coef: [31.15, -0.01357, 2.680e-5, -1.168e-8, 0],
  },
  'O2': {
    name: 'Oxygen',
    MW: 31.999,
    Tc: 154.58,
    Pc: 50.43,
    omega: 0.022,
    Tb: 90.20,
    Hf: 0.0,
    Cp_coef: [25.46, 0.01520, -0.7155e-5, 1.312e-9, 0],
  },
  'MEA': {
    name: 'Monoethanolamine',
    MW: 61.08,
    Tc: 678.2,
    Pc: 80.0,
    omega: 0.545,
    Tb: 443.15,
    Hf: -302.5,
    Cp_coef: [61.5, 0.280, 0, 0, 0], // Simplified
  },
};

/**
 * Calculate ideal gas heat capacity (J/mol/K)
 */
export function idealGasCp(component: Component, T: number): number {
  const [a, b, c, d, e] = component.Cp_coef;
  return a + b*T + c*T**2 + d*T**3 + e*T**4;
}

/**
 * Calculate ideal gas enthalpy (kJ/mol)
 * H = Hf + ∫Cp dT from 298.15K to T
 */
export function idealGasEnthalpy(component: Component, T: number): number {
  const T0 = 298.15;
  const [a, b, c, d, e] = component.Cp_coef;
  
  // Integrate Cp from T0 to T
  const deltaH_J = (
    a * (T - T0) +
    (b/2) * (T**2 - T0**2) +
    (c/3) * (T**3 - T0**3) +
    (d/4) * (T**4 - T0**4) +
    (e/5) * (T**5 - T0**5)
  );
  
  return component.Hf + deltaH_J / 1000; // Convert J to kJ
}

/**
 * Calculate mixture enthalpy (kJ/mol)
 */
export function mixtureEnthalpy(
  composition: Record<string, number>, // mole fractions
  T: number,
  _P: number
): number {
  let H_mix = 0;
  
  for (const [compName, moleFrac] of Object.entries(composition)) {
    const comp = COMPONENT_DATABASE[compName];
    if (comp) {
      H_mix += moleFrac * idealGasEnthalpy(comp, T);
    }
  }
  
  return H_mix;
}

/**
 * Calculate vapor pressure using Antoine equation
 * log10(P_vap) = A - B/(C + T)
 * P in mmHg, T in °C
 */
export function vaporPressure(component: Component, T_K: number): number {
  // Simplified Clausius-Clapeyron for now
  // P_vap = P_ref * exp((Hvap/R) * (1/T_ref - 1/T))
  const R = 8.314; // J/mol/K
  const T_ref = component.Tb;
  const Hvap = 40.7 * component.MW; // Trouton's rule approximation (J/mol)
  
  const P_vap_bar = Math.exp((Hvap/R) * (1/T_ref - 1/T_K));
  
  return P_vap_bar;
}

/**
 * Calculate K-values (vapor-liquid equilibrium)
 * K_i = y_i / x_i = P_vap_i / P_total (Raoult's Law for ideal)
 */
export function calculateKValues(
  components: string[],
  T: number,
  P: number
): Record<string, number> {
  const K_values: Record<string, number> = {};
  
  for (const compName of components) {
    const comp = COMPONENT_DATABASE[compName];
    if (comp) {
      const P_vap = vaporPressure(comp, T);
      K_values[compName] = P_vap / P;
    }
  }
  
  return K_values;
}

/**
 * Rachford-Rice flash calculation
 * Solves: Σ[z_i(K_i - 1)/(1 + V(K_i - 1))] = 0
 * Returns vapor fraction (V)
 */
export function rachfordRiceFlash(
  z: Record<string, number>, // Feed composition
  K: Record<string, number>  // K-values
): number {
  const components = Object.keys(z);
  
  // Initial guess for vapor fraction
  let V = 0.5;
  
  // Newton-Raphson iteration
  for (let iter = 0; iter < 50; iter++) {
    let f = 0;
    let df = 0;
    
    for (const comp of components) {
      const z_i = z[comp];
      const K_i = K[comp];
      const denom = 1 + V * (K_i - 1);
      
      f += z_i * (K_i - 1) / denom;
      df -= z_i * (K_i - 1)**2 / (denom**2);
    }
    
    // Newton step
    const V_new = V - f / df;
    
    // Bounds
    if (V_new < 0) V = 0;
    else if (V_new > 1) V = 1;
    else V = V_new;
    
    // Check convergence
    if (Math.abs(f) < 1e-6) {
      break;
    }
  }
  
  return V;
}

/**
 * Calculate phase compositions from flash
 */
export function flashComposition(
  z: Record<string, number>,
  K: Record<string, number>,
  V: number
): { vapor: Record<string, number>; liquid: Record<string, number> } {
  const vapor: Record<string, number> = {};
  const liquid: Record<string, number> = {};
  
  for (const [comp, z_i] of Object.entries(z)) {
    const K_i = K[comp];
    
    // Rachford-Rice equation rearranged
    liquid[comp] = z_i / (1 + V * (K_i - 1));
    vapor[comp] = K_i * liquid[comp];
  }
  
  return { vapor, liquid };
}

/**
 * Calculate density (kg/m³)
 * Using ideal gas law for vapor, simple correlation for liquid
 */
export function density(
  composition: Record<string, number>,
  T: number,
  P: number,
  phase: 'V' | 'L'
): number {
  if (phase === 'V') {
    // Ideal gas: ρ = PM/RT
    let MW_avg = 0;
    for (const [comp, frac] of Object.entries(composition)) {
      const component = COMPONENT_DATABASE[comp];
      if (component) MW_avg += frac * component.MW;
    }
    
    const R = 8.314; // J/mol/K
    const P_Pa = P * 1e5; // bar to Pa
    return (P_Pa * MW_avg) / (R * T * 1000); // kg/m³
  } else {
    // Liquid: use typical liquid densities
    // This is very simplified - should use correlations like Rackett
    return 1000; // kg/m³ (placeholder)
  }
}

