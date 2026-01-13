/**
 * Test script for simulation engine
 * Run with: npx tsx src/sim/test-sim.ts
 */

import { createSimpleGasPlantTemplate } from '../data/seed';
import { convertProjectV1toV2 } from './converter';
import { simulateV2 } from './engine-v2';

const template = createSimpleGasPlantTemplate();
const projectV2 = convertProjectV1toV2(template);
const result = simulateV2(projectV2);

console.log('Status:', result.status);
console.log('Converged:', result.converged);
console.log('');
console.log('Stream Results:');
console.log('─'.repeat(90));
console.log(
  'Stream'.padEnd(25) +
    'T (K)'.padStart(10) +
    'P (bar)'.padStart(10) +
    'Flow'.padStart(12) +
    'Phase'.padStart(12) +
    'VapFrac'.padStart(10)
);
console.log('─'.repeat(90));

interface StreamResult {
  name: string;
  T?: number;
  P?: number;
  flow?: number;
  phase?: string;
  vaporFrac?: number;
}

result.rawOutputs.streams.forEach((s: StreamResult) => {
  const name = s.name
    .replace('-out', '')
    .replace('-vapor', ' (V)')
    .replace('-liquid', ' (L)');
  const T = s.T ? s.T.toFixed(1) : '-';
  const P = s.P ? s.P.toFixed(2) : '-'; // Already in bar from engine
  const flow = s.flow ? s.flow.toFixed(1) : '-';
  const phase = s.phase || '?';
  const vf = s.vaporFrac !== undefined ? s.vaporFrac.toFixed(3) : '-';
  console.log(
    name.padEnd(25) +
      T.padStart(10) +
      P.padStart(10) +
      flow.padStart(12) +
      phase.padStart(12) +
      vf.padStart(10)
  );
});
console.log('─'.repeat(90));

// Material balance check
const mixerOut = result.rawOutputs.streams.find((s: StreamResult) =>
  s.name.includes('Mixer')
);
const flashV = result.rawOutputs.streams.find((s: StreamResult) =>
  s.name.includes('vapor')
);
const flashL = result.rawOutputs.streams.find((s: StreamResult) =>
  s.name.includes('liquid')
);

console.log('');
console.log('Material Balance Check:');
if (mixerOut && flashV && flashL) {
  console.log(
    `  Mixer output: ${mixerOut.flow?.toFixed(2)} kmol/h`
  );
  console.log(
    `  Flash V + L:  ${((flashV.flow || 0) + (flashL.flow || 0)).toFixed(2)} kmol/h (${flashV.flow?.toFixed(2)} + ${flashL.flow?.toFixed(2)})`
  );
}
