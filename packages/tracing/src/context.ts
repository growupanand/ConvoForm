/**
 * Trace Context Utilities
 *
 * W3C Trace Context propagation utilities for distributed tracing
 * https://www.w3.org/TR/trace-context/
 */

import { type SpanContext, TraceFlags, trace } from "@opentelemetry/api";

// Re-export SpanContext for use in other modules
export type { SpanContext } from "@opentelemetry/api";

/**
 * Header name for W3C Trace Context
 */
export const TRACEPARENT_HEADER = "traceparent";
export const TRACESTATE_HEADER = "tracestate";

/**
 * Generate a random trace ID (32 hex characters)
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a random span ID (16 hex characters)
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create a traceparent header value
 * Format: version-traceId-spanId-traceFlags
 * Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */
export function createTraceparent(
  traceId: string,
  spanId: string,
  sampled = true,
): string {
  const version = "00";
  const flags = sampled ? "01" : "00";
  return `${version}-${traceId}-${spanId}-${flags}`;
}

/**
 * Parse a traceparent header value
 */
export function parseTraceparent(traceparent: string): SpanContext | null {
  const parts = traceparent.split("-");
  if (parts.length !== 4) {
    return null;
  }

  const [version, traceId, spanId, flags] = parts;

  // Validate version (currently only "00" is supported)
  if (version !== "00") {
    return null;
  }

  // Validate trace ID (32 hex characters, not all zeros)
  if (
    !traceId ||
    !/^[0-9a-f]{32}$/.test(traceId) ||
    traceId === "0".repeat(32)
  ) {
    return null;
  }

  // Validate span ID (16 hex characters, not all zeros)
  if (!spanId || !/^[0-9a-f]{16}$/.test(spanId) || spanId === "0".repeat(16)) {
    return null;
  }

  // Validate flags (2 hex characters)
  if (!flags || !/^[0-9a-f]{2}$/.test(flags)) {
    return null;
  }

  return {
    traceId,
    spanId,
    traceFlags: Number.parseInt(flags, 16),
    isRemote: true,
  };
}

/**
 * Extract trace context from HTTP headers
 */
export function extractTraceContext(
  headers: Record<string, string | undefined>,
): SpanContext | null {
  const traceparent = headers[TRACEPARENT_HEADER] || headers.Traceparent;
  if (!traceparent) {
    return null;
  }
  return parseTraceparent(traceparent);
}

/**
 * Inject trace context into HTTP headers
 */
export function injectTraceContext(
  spanContext: SpanContext,
): Record<string, string> {
  const traceparent = createTraceparent(
    spanContext.traceId,
    spanContext.spanId,
    (spanContext.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED,
  );

  const headers: Record<string, string> = {
    [TRACEPARENT_HEADER]: traceparent,
  };

  if (spanContext.traceState) {
    headers[TRACESTATE_HEADER] = spanContext.traceState.serialize();
  }

  return headers;
}

/**
 * Get the current trace ID from active context
 */
export function getCurrentTraceId(): string | null {
  const span = trace.getActiveSpan();
  if (!span) {
    return null;
  }
  return span.spanContext().traceId;
}

/**
 * Get the current span context
 */
export function getCurrentSpanContext(): SpanContext | null {
  const span = trace.getActiveSpan();
  if (!span) {
    return null;
  }
  return span.spanContext();
}

/**
 * Create a new root trace context (for frontend use)
 */
export function createRootTraceContext(): {
  traceId: string;
  spanId: string;
  traceparent: string;
} {
  const traceId = generateTraceId();
  const spanId = generateSpanId();
  const traceparent = createTraceparent(traceId, spanId, true);

  return {
    traceId,
    spanId,
    traceparent,
  };
}
