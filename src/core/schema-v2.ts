/**
 * Schema V2: Simplified Block-Based Architecture
 *
 * This is a simplified version of the original schema that removes
 * discriminated unions and complex port systems in favor of a more
 * intuitive block coding approach.
 */

import { z } from 'zod';
import type { ThermoConfig, EconomicConfig, UnitType, Phase } from './schema';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Simple stream data structure
 * No more complex StreamSpec discriminated unions
 */
export type StreamData = {
  T: number;        // Temperature in Kelvin
  P: number;        // Pressure in Pascal
  flow: number;     // Flow rate in kmol/h
  composition: Record<string, number>;  // Mole fractions (sum = 1.0)
  phase: Phase;     // 'V' | 'L' | 'VL'

  // Optional calculated properties
  H?: number;       // Enthalpy in kJ/kmol
  vaporFrac?: number;  // Vapor fraction for two-phase
};

export const StreamDataSchema = z.object({
  T: z.number(),
  P: z.number(),
  flow: z.number(),
  composition: z.record(z.string(), z.number()),
  phase: z.enum(['V', 'L', 'VL', 'S']),
  H: z.number().optional(),
  vaporFrac: z.number().optional(),
});

/**
 * Simplified block with direct parameter access
 * No more ParamValue discriminated unions!
 */
export type BlockV2 = {
  id: string;
  type: UnitType;
  name: string;
  x: number;        // Canvas position
  y: number;        // Canvas position

  // Simple key-value params (no discriminated unions!)
  params: Record<string, number | string | boolean | Record<string, number>>;

  // Runtime data (populated during simulation)
  inputs?: Record<string, StreamData>;
  outputs?: Record<string, StreamData>;

  // Execution status
  status?: 'idle' | 'computing' | 'done' | 'error';
  error?: string;

  // Block-level results
  duty?: number;     // Heat duty (kW)
  power?: number;    // Power consumption (kW)
};

export const BlockV2Schema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  params: z.record(z.string(), z.union([
    z.number(),
    z.string(),
    z.boolean(),
    z.record(z.string(), z.number())
  ])),
  inputs: z.record(z.string(), StreamDataSchema).optional(),
  outputs: z.record(z.string(), StreamDataSchema).optional(),
  status: z.enum(['idle', 'computing', 'done', 'error']).optional(),
  error: z.string().optional(),
  duty: z.number().optional(),
  power: z.number().optional(),
});

/**
 * Simple connection structure
 * Keeps the from/to port system for UI compatibility
 */
export type ConnectionV2 = {
  id: string;
  name?: string; // Stream name (e.g., "S1", "S2") for display
  from: { blockId: string; port: string };
  to: { blockId: string; port: string };
};

export const ConnectionV2Schema = z.object({
  id: z.string(),
  name: z.string().optional(),
  from: z.object({
    blockId: z.string(),
    port: z.string(),
  }),
  to: z.object({
    blockId: z.string(),
    port: z.string(),
  }),
});

/**
 * Simplified project structure
 */
export type ProjectV2 = {
  id: string;
  name: string;
  components: string[];  // Component names (e.g., ['H2O', 'CO2', 'N2'])
  blocks: BlockV2[];
  connections: ConnectionV2[];

  // Keep for UI compatibility and future use
  thermodynamics?: ThermoConfig;
  economics?: EconomicConfig;
};

export const ProjectV2Schema = z.object({
  id: z.string(),
  name: z.string(),
  components: z.array(z.string()),
  blocks: z.array(BlockV2Schema),
  connections: z.array(ConnectionV2Schema),
  thermodynamics: z.any().optional(),
  economics: z.any().optional(),
});

// ============================================================================
// SIMULATION RESULTS
// ============================================================================

/**
 * Stream result for UI display
 */
export type StreamResult = {
  id: string;
  name: string;
  T: number;       // Kelvin
  P: number;       // bar (converted for UI)
  flow: number;    // kmol/h
  composition: Record<string, number>;
  phase: Phase;
  H: number;       // kJ/kmol
  vaporFrac?: number;
};

export const StreamResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  T: z.number(),
  P: z.number(),
  flow: z.number(),
  composition: z.record(z.string(), z.number()),
  phase: z.enum(['V', 'L', 'VL', 'S']),
  H: z.number(),
  vaporFrac: z.number().optional(),
});

/**
 * Simulation result structure
 * Compatible with UI expectations
 */
export type SimulationResultV2 = {
  status: 'done' | 'error';
  converged: boolean;

  // KPIs (arbitrary keys allowed)
  kpis: Record<string, number>;

  // Detailed outputs
  rawOutputs: {
    streams: StreamResult[];
    log: string[];  // Execution log for debugging
    blockResults?: Record<string, {
      duty?: number;
      power?: number;
      vaporFraction?: number;
      [key: string]: any;
    }>;
    validationErrors?: Array<{
      category: string;
      message: string;
    }>;
  };
};

export const SimulationResultV2Schema = z.object({
  status: z.enum(['done', 'error']),
  converged: z.boolean(),
  kpis: z.record(z.string(), z.number()),
  rawOutputs: z.object({
    streams: z.array(StreamResultSchema),
    log: z.array(z.string()),
    blockResults: z.record(z.string(), z.any()).optional(),
    validationErrors: z.array(z.object({
      category: z.string(),
      message: z.string(),
    })).optional(),
  }),
});

// ============================================================================
// BLOCK FUNCTION TYPE
// ============================================================================

/**
 * Type signature for pure block functions
 * Each block type implements this interface
 */
export type BlockFunction = (
  inputs: Record<string, StreamData>,
  params: Record<string, any>,
  components: string[]
) => {
  outputs: Record<string, StreamData>;
  duty?: number;      // kW
  power?: number;     // kW
  conversion?: number; // For reactors
  [key: string]: any; // Allow additional block-specific results
};

// ============================================================================
// VALIDATION
// ============================================================================

export type ValidationError = {
  category: 'connectivity' | 'parameter' | 'composition' | 'physical';
  message: string;
  blockId?: string;
  streamId?: string;
};

export const ValidationErrorSchema = z.object({
  category: z.enum(['connectivity', 'parameter', 'composition', 'physical']),
  message: z.string(),
  blockId: z.string().optional(),
  streamId: z.string().optional(),
});
