/**
 * Tracing Types
 *
 * Type definitions for OpenTelemetry tracing in ConvoForm
 */

import type { Span, SpanContext, Tracer } from "@opentelemetry/api";

/**
 * Trace context extracted from HTTP headers
 */
export interface TraceContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
  traceState?: string;
}

/**
 * Span attributes for conversation tracing
 */
export interface ConversationSpanAttributes {
  "conversation.id"?: string;
  "conversation.form_id"?: string;
  "conversation.organization_id"?: string;
  "conversation.type"?: "new" | "existing";
  "field.id"?: string;
  "field.type"?: string;
  "ai.model"?: string;
  "ai.token_count"?: number;
  "ai.duration_ms"?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Configuration for the tracer
 */
export interface TracerConfig {
  serviceName: string;
  environment?: string;
  axiom?: {
    token: string;
    dataset: string;
    enabled: boolean;
  };
  console?: {
    enabled: boolean;
  };
}

/**
 * Wrapper interface for tracing operations
 */
export interface ITracer {
  /**
   * Start a new span
   */
  startSpan(name: string, attributes?: ConversationSpanAttributes): Span;

  /**
   * Execute a function within a span
   */
  withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes?: ConversationSpanAttributes,
  ): Promise<T>;

  /**
   * Get the underlying OpenTelemetry tracer
   */
  getTracer(): Tracer;

  /**
   * Extract trace context from HTTP headers
   */
  extractContext(
    headers: Record<string, string | undefined>,
  ): SpanContext | null;

  /**
   * Inject trace context into HTTP headers
   */
  injectContext(): Record<string, string>;

  /**
   * Get the current trace ID
   */
  getCurrentTraceId(): string | null;

  /**
   * Flush all pending spans
   */
  flush(): Promise<void>;
}
