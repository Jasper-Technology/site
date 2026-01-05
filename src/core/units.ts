import type { Quantity } from './schema';

export function quantity(value: number, unit: string): Quantity {
  return { value, unit };
}

export function convertQuantity(q: Quantity, targetUnit: string): Quantity {
  // Simple stub - in real implementation would have unit conversion logic
  // For now, just return the same value if units match, otherwise return as-is
  if (q.unit === targetUnit) {
    return q;
  }
  // TODO: Implement proper unit conversion
  return q;
}

