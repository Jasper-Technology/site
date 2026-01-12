/**
 * Feed Block
 *
 * Initializes a stream from specifications.
 * All feeds must have T, P, flow, composition, and phase specified.
 * Calculates rigorous enthalpy using thermodynamic properties.
 */

import type { BlockFunction } from '../../core/schema-v2';
import { mixtureEnthalpy } from '../thermo/properties';

export const feedBlock: BlockFunction = (_inputs, params, _components) => {
  // Extract parameters
  const T = params.T as number;
  const P = params.P as number;
  const flow = params.flow as number;
  const composition = params.composition as Record<string, number>;
  const phase = (params.phase as string) || 'V';

  // Validation
  if (!T || !P || !flow || !composition) {
    throw new Error('Feed block missing required parameters (T, P, flow, composition)');
  }

  // Check composition sums to 1.0
  const sum = Object.values(composition).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.01) {
    throw new Error(`Feed composition must sum to 1.0 (got ${sum.toFixed(3)})`);
  }

  // Calculate rigorous mixture enthalpy (kJ/mol)
  const H = mixtureEnthalpy(composition, T, P);

  return {
    outputs: {
      out: {
        T,
        P,
        flow,
        composition,
        phase: phase as 'V' | 'L' | 'VL',
        H,
      },
    },
  };
};
