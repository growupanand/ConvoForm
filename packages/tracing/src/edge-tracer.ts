/**
 * Edge-Compatible Tracer
 *
 * Lightweight tracer for Vercel Edge runtime that uses fetch to send spans to Axiom
 * Since OpenTelemetry Node SDK doesn't work on Edge, we implement a minimal tracer
 */

import {
  createTraceparent,
  extractTraceContext,
  generateSpanId,
  generateTraceId,
} from "./context";
import type { ConversationSpanAttributes } from "./types";

/**
 * Axiom OTLP endpoint for traces
 */
const AXIOM_OTLP_ENDPOINT = "https://api.axiom.co/v1/traces";

/**
 * Edge-compatible span representation
 */
/**
 * Span event representation (logs/annotations within a span)
 */
interface SpanEvent {
  name: string;
  time: number;
  attributes?: Record<string, string | number | boolean>;
}

interface EdgeSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
  status: "ok" | "error";
  errorMessage?: string;
}

/**
 * Configuration for Edge tracer
 */
interface EdgeTracerConfig {
  serviceName: string;
  axiomToken?: string;
  axiomDataset?: string;
  enabled?: boolean;
  collectorEndpoint?: string;
}

/**
 * Edge-compatible tracer for Vercel Edge runtime
 */
export class EdgeTracer {
  private config: EdgeTracerConfig;
  private currentTraceId: string | null = null;
  private currentSpanId: string | null = null;
  private spans: EdgeSpan[] = [];

  constructor(config: EdgeTracerConfig) {
    this.config = config;
  }

  /**
   * Set a custom trace ID (e.g., using conversationId for unified conversation traces)
   * This should be called before starting spans if you want all spans to share the same trace.
   */
  setTraceId(traceId: string): void {
    // Convert to 32-char hex format if needed (trace IDs must be 32 hex chars)
    // If the input is shorter, pad it. If longer, hash it.
    this.currentTraceId = this.normalizeTraceId(traceId);
    this.currentSpanId = null;
  }

  /**
   * Convert any string to a valid 32-character hex trace ID
   */
  private normalizeTraceId(input: string): string {
    // If already a valid 32-char hex string, use it
    if (/^[0-9a-f]{32}$/i.test(input)) {
      return input.toLowerCase();
    }

    // Otherwise, create a deterministic 32-char hex from the input
    // Simple hash: convert each char to hex and pad/truncate
    let hex = "";
    for (let i = 0; i < input.length; i++) {
      hex += input.charCodeAt(i).toString(16).padStart(2, "0");
    }
    // Pad with zeros or truncate to 32 chars
    return hex.padEnd(32, "0").substring(0, 32);
  }

  /**
   * Get the current trace ID
   */
  getTraceId(): string | null {
    return this.currentTraceId;
  }

  /**
   * Start a new trace from incoming headers or create a new one
   * Note: When extracting from headers, the parent span is external (from another service)
   * When creating a new trace, there is no parent span
   */
  startTrace(headers?: Record<string, string | undefined>): {
    traceId: string;
    spanId: string;
  } {
    // If trace ID is already set (via setTraceId), use it
    if (this.currentTraceId) {
      return {
        traceId: this.currentTraceId,
        spanId: generateSpanId(),
      };
    }

    if (headers) {
      const parentContext = extractTraceContext(headers);
      if (parentContext) {
        // External parent span from incoming request headers
        // The parentContext.spanId is from the calling service and may not be recorded here
        this.currentTraceId = parentContext.traceId;
        // Set currentSpanId to null - child spans will be root spans in this service
        // but still part of the same trace
        this.currentSpanId = null;
        return {
          traceId: parentContext.traceId,
          spanId: parentContext.spanId,
        };
      }
    }

    // New trace - no parent span
    this.currentTraceId = generateTraceId();
    this.currentSpanId = null;
    return {
      traceId: this.currentTraceId,
      spanId: generateSpanId(), // Return a new span ID for reference, but don't set as current
    };
  }

  /**
   * Start a new span
   */
  startSpan(
    name: string,
    attributes?: ConversationSpanAttributes,
  ): EdgeSpanHandle {
    const spanId = generateSpanId();
    const span: EdgeSpan = {
      traceId: this.currentTraceId || generateTraceId(),
      spanId,
      parentSpanId: this.currentSpanId || undefined,
      name,
      startTime: Date.now(),
      attributes: {},
      events: [],
      status: "ok",
    };

    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (value !== undefined) {
          span.attributes[key] = value;
        }
      }
    }

    // Update current span for nesting
    const previousSpanId = this.currentSpanId;
    this.currentSpanId = spanId;

    this.spans.push(span);

    return new EdgeSpanHandle(span, () => {
      this.currentSpanId = previousSpanId;
    });
  }

  /**
   * Execute a function within a span
   */
  async withSpan<T>(
    name: string,
    fn: (span: EdgeSpanHandle) => Promise<T>,
    attributes?: ConversationSpanAttributes,
  ): Promise<T> {
    const span = this.startSpan(name, attributes);

    try {
      const result = await fn(span);
      span.setStatus("ok");
      return result;
    } catch (error) {
      span.setStatus(
        "error",
        error instanceof Error ? error.message : "Unknown error",
      );
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Get the current trace ID
   */
  getCurrentTraceId(): string | null {
    return this.currentTraceId;
  }

  /**
   * Get traceparent header value
   */
  getTraceparent(): string | null {
    if (!this.currentTraceId || !this.currentSpanId) {
      return null;
    }
    return createTraceparent(this.currentTraceId, this.currentSpanId, true);
  }

  /**
   * Flush all spans to Axiom
   */
  async flush(): Promise<void> {
    if (!this.config.enabled || this.spans.length === 0) {
      return;
    }

    const resourceSpans = this.buildOTLPPayload();
    const endpoint = this.config.collectorEndpoint || AXIOM_OTLP_ENDPOINT;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.axiomToken) {
      headers.Authorization = `Bearer ${this.config.axiomToken}`;
    }
    if (this.config.axiomDataset) {
      headers["X-Axiom-Dataset"] = this.config.axiomDataset;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ resourceSpans }),
      });

      if (!response.ok && this.config.axiomToken) {
        // Only log if using direct axiom, proxy usually handles logging or returns 500
        console.warn(
          `Failed to flush traces: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error("Failed to flush spans to Axiom:", error);
    }

    this.spans = [];
  }

  /**
   * Build OTLP-compatible payload
   */
  private buildOTLPPayload() {
    const spans = this.spans.map((span) => ({
      traceId: span.traceId,
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,
      name: span.name,
      startTimeUnixNano: span.startTime * 1_000_000,
      endTimeUnixNano: (span.endTime || Date.now()) * 1_000_000,
      attributes: Object.entries(span.attributes).map(([key, value]) => ({
        key,
        value: {
          stringValue: String(value),
        },
      })),
      events: span.events.map((event) => ({
        name: event.name,
        timeUnixNano: event.time * 1_000_000,
        attributes: event.attributes
          ? Object.entries(event.attributes).map(([key, value]) => ({
              key,
              value: {
                stringValue: String(value),
              },
            }))
          : [],
      })),
      status: {
        code: span.status === "ok" ? 1 : 2,
        message: span.errorMessage,
      },
    }));

    return [
      {
        resource: {
          attributes: [
            {
              key: "service.name",
              value: { stringValue: this.config.serviceName },
            },
          ],
        },
        scopeSpans: [
          {
            scope: { name: "@convoform/tracing" },
            spans,
          },
        ],
      },
    ];
  }
}

/**
 * Handle for an active span
 */
export class EdgeSpanHandle {
  private span: EdgeSpan;
  private onEnd: () => void;
  private ended = false;

  constructor(span: EdgeSpan, onEnd: () => void) {
    this.span = span;
    this.onEnd = onEnd;
  }

  /**
   * Set an attribute on the span
   */
  setAttribute(key: string, value: string | number | boolean): this {
    this.span.attributes[key] = value;
    return this;
  }

  /**
   * Set multiple attributes
   */
  setAttributes(attributes: Record<string, string | number | boolean>): this {
    for (const [key, value] of Object.entries(attributes)) {
      this.span.attributes[key] = value;
    }
    return this;
  }

  /**
   * Set the span status
   */
  setStatus(status: "ok" | "error", message?: string): this {
    this.span.status = status;
    if (message) {
      this.span.errorMessage = message;
    }
    return this;
  }

  /**
   * Add an event to the span (a timestamped annotation)
   */
  addEvent(
    name: string,
    attributes?: Record<string, string | number | boolean>,
  ): this {
    this.span.events.push({
      name,
      time: Date.now(),
      attributes,
    });
    return this;
  }

  /**
   * End the span
   */
  end(): void {
    if (!this.ended) {
      this.span.endTime = Date.now();
      this.ended = true;
      this.onEnd();
    }
  }

  /**
   * Get the span ID
   */
  getSpanId(): string {
    return this.span.spanId;
  }

  /**
   * Get the trace ID
   */
  getTraceId(): string {
    return this.span.traceId;
  }
}

/**
 * Create an Edge-compatible tracer
 */
export function createEdgeTracer(serviceName: string): EdgeTracer {
  const envEnabled =
    process.env.AXIOM_ENABLED ?? process.env.AXIOM_TRACING_ENABLED;

  return new EdgeTracer({
    serviceName,
    // Use unified env vars with fallback to legacy names
    axiomToken: process.env.AXIOM_TOKEN || process.env.AXIOM_OTLP_TOKEN,
    axiomDataset: process.env.AXIOM_DATASET || "convoform-dev",
    enabled: envEnabled ? envEnabled === "true" : true,
  });
}

/**
 * Configuration for browser tracer
 */
export interface BrowserTracerConfig {
  /**
   * Service name for the tracer (e.g., "convoform-react-client")
   */
  serviceName: string;

  /**
   * URL of the trace collector endpoint
   * @default "/api/ingest/traces"
   */
  collectorEndpoint?: string;

  /**
   * Axiom dataset name (optional, sent as X-Axiom-Dataset header)
   * The server-side proxy typically handles this, but can be overridden
   */
  axiomDataset?: string;
}

/**
 * Create a Browser-compatible tracer
 *
 * This tracer is designed for client-side use and sends traces to a
 * server-side proxy endpoint (to avoid exposing Axiom credentials).
 *
 * Does NOT read from environment variables - configuration must be
 * passed explicitly or use defaults.
 *
 * @example
 * ```typescript
 * // Simple usage with just service name
 * const tracer = createBrowserTracer("my-frontend");
 *
 * // With custom configuration
 * const tracer = createBrowserTracer({
 *   serviceName: "my-frontend",
 *   collectorEndpoint: "/custom/traces",
 *   axiomDataset: "my-dataset",
 * });
 * ```
 */
export function createBrowserTracer(
  config: BrowserTracerConfig | string,
): EdgeTracer {
  const normalizedConfig: BrowserTracerConfig =
    typeof config === "string" ? { serviceName: config } : config;

  const {
    serviceName,
    collectorEndpoint = "/api/ingest/traces",
    axiomDataset,
  } = normalizedConfig;

  return new EdgeTracer({
    serviceName,
    // No axiomToken - browser tracer sends to proxy which handles auth
    axiomToken: undefined,
    axiomDataset,
    collectorEndpoint,
    // Always enabled for browser tracer since it uses proxy
    enabled: true,
  });
}
