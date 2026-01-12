/**
 * @convoform/tracing
 *
 * OpenTelemetry distributed tracing for ConvoForm with Axiom integration
 */

import {
  getDefaultConfig,
  parseTracerConfig,
  validateAxiomConfig,
} from "./src/config";
import { ConvoFormTracer } from "./src/tracer";
import type { ITracer, TracerConfig } from "./src/types";

// Export types
export type {
  ITracer,
  TracerConfig,
  ConversationSpanAttributes,
  TraceContext,
} from "./src/types";

// Export context utilities
export {
  TRACEPARENT_HEADER,
  TRACESTATE_HEADER,
  generateTraceId,
  generateSpanId,
  createTraceparent,
  parseTraceparent,
  extractTraceContext,
  injectTraceContext,
  getCurrentTraceId,
  getCurrentSpanContext,
  createRootTraceContext,
} from "./src/context";

// Singleton instance per service
const tracerInstances: Map<string, ITracer> = new Map();

/**
 * Create a new tracer instance with custom configuration
 */
export function createTracer(
  serviceName: string,
  config?: Partial<TracerConfig>,
): ITracer {
  const fullConfig = config
    ? { ...getDefaultConfig(serviceName), ...config, serviceName }
    : parseTracerConfig(serviceName);

  // Validate Axiom config if enabled
  if (fullConfig.axiom?.enabled) {
    validateAxiomConfig(fullConfig);
  }

  return new ConvoFormTracer(fullConfig);
}

/**
 * Get or create singleton tracer instance for a service
 */
export function getTracer(serviceName: string): ITracer {
  let tracer = tracerInstances.get(serviceName);
  if (!tracer) {
    tracer = createTracer(serviceName);
    tracerInstances.set(serviceName, tracer);
  }
  return tracer;
}

/**
 * Reset tracer instance (useful for testing)
 */
export function resetTracer(serviceName: string): void {
  tracerInstances.delete(serviceName);
}

/**
 * Reset all tracer instances
 */
export function resetAllTracers(): void {
  tracerInstances.clear();
}

// Re-export tracer class for advanced use cases
export { ConvoFormTracer } from "./src/tracer";

// Edge-compatible tracer for Vercel Edge runtime
export {
  EdgeTracer,
  EdgeSpanHandle,
  createEdgeTracer,
  createBrowserTracer,
  type BrowserTracerConfig,
} from "./src/edge-tracer";

// Server-side trace ingestion handler
export {
  createTraceIngestHandler,
  type TraceIngestConfig,
  type TraceIngestResult,
} from "./src/trace-ingest";

// Import for default export
import { createEdgeTracer as createEdgeTracerFn } from "./src/edge-tracer";

// Default export
export default {
  createTracer,
  getTracer,
  resetTracer,
  resetAllTracers,
  createEdgeTracer: createEdgeTracerFn,
};
