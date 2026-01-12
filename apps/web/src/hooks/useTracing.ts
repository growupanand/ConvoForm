"use client";

/**
 * useTracing Hook
 *
 * Client-side hook for generating and managing trace context
 * Enables distributed tracing from browser to backend services
 */

import { useCallback, useRef } from "react";

// W3C Trace Context header name
const TRACEPARENT_HEADER = "traceparent";

/**
 * Generate a random hex string of specified byte length
 */
function generateHexId(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a trace ID (32 hex characters / 16 bytes)
 */
function generateTraceId(): string {
  return generateHexId(16);
}

/**
 * Generate a span ID (16 hex characters / 8 bytes)
 */
function generateSpanId(): string {
  return generateHexId(8);
}

/**
 * Create a traceparent header value
 * Format: version-traceId-spanId-traceFlags
 * Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */
function createTraceparent(
  traceId: string,
  spanId: string,
  sampled = true,
): string {
  const version = "00";
  const flags = sampled ? "01" : "00";
  return `${version}-${traceId}-${spanId}-${flags}`;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  traceparent: string;
}

export interface UseTracingReturn {
  /**
   * Start a new trace and return the trace context
   */
  startTrace: () => TraceContext;

  /**
   * Get headers to inject into API requests
   */
  getTraceHeaders: () => Record<string, string>;

  /**
   * Get the current trace ID (null if no active trace)
   */
  getCurrentTraceId: () => string | null;

  /**
   * Clear the current trace context
   */
  clearTrace: () => void;
}

/**
 * Hook for managing trace context in React components
 *
 * @example
 * ```tsx
 * const { startTrace, getTraceHeaders } = useTracing();
 *
 * const handleSubmit = async () => {
 *   startTrace();
 *   await fetch('/api/conversation', {
 *     method: 'POST',
 *     headers: {
 *       ...getTraceHeaders(),
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify(data),
 *   });
 * };
 * ```
 */
export function useTracing(): UseTracingReturn {
  const traceContextRef = useRef<TraceContext | null>(null);

  const startTrace = useCallback((): TraceContext => {
    const traceId = generateTraceId();
    const spanId = generateSpanId();
    const traceparent = createTraceparent(traceId, spanId, true);

    const context: TraceContext = {
      traceId,
      spanId,
      traceparent,
    };

    traceContextRef.current = context;
    return context;
  }, []);

  const getTraceHeaders = useCallback((): Record<string, string> => {
    if (!traceContextRef.current) {
      // Auto-start a trace if none exists
      const context = startTrace();
      return {
        [TRACEPARENT_HEADER]: context.traceparent,
      };
    }

    return {
      [TRACEPARENT_HEADER]: traceContextRef.current.traceparent,
    };
  }, [startTrace]);

  const getCurrentTraceId = useCallback((): string | null => {
    return traceContextRef.current?.traceId ?? null;
  }, []);

  const clearTrace = useCallback((): void => {
    traceContextRef.current = null;
  }, []);

  return {
    startTrace,
    getTraceHeaders,
    getCurrentTraceId,
    clearTrace,
  };
}

export default useTracing;
