/**
 * Tracer Implementation
 *
 * OpenTelemetry tracer with Axiom OTLP exporter
 */

import {
  type Span,
  type SpanContext,
  SpanStatusCode,
  type Tracer,
  context,
  trace,
} from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions";
import {
  extractTraceContext,
  getCurrentTraceId,
  injectTraceContext,
} from "./context";
import type {
  ConversationSpanAttributes,
  ITracer,
  TracerConfig,
} from "./types";

/**
 * Axiom OTLP endpoint for traces
 */
const AXIOM_OTLP_ENDPOINT = "https://api.axiom.co/v1/traces";

/**
 * ConvoForm Tracer implementation
 */
export class ConvoFormTracer implements ITracer {
  private tracer: Tracer;
  private provider: BasicTracerProvider;
  private config: TracerConfig;

  constructor(config: TracerConfig) {
    this.config = config;
    this.provider = this.createProvider(config);
    this.tracer = this.provider.getTracer(config.serviceName);
  }

  /**
   * Create the tracer provider with exporters
   */
  private createProvider(config: TracerConfig): BasicTracerProvider {
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.environment || "development",
    });

    const provider = new BasicTracerProvider({ resource });

    // Add Axiom OTLP exporter if configured
    if (config.axiom?.enabled && config.axiom?.token) {
      const axiomExporter = new OTLPTraceExporter({
        url: AXIOM_OTLP_ENDPOINT,
        headers: {
          Authorization: `Bearer ${config.axiom.token}`,
          "X-Axiom-Dataset": config.axiom.dataset,
        },
      });

      provider.addSpanProcessor(new BatchSpanProcessor(axiomExporter));
    }

    // Add console exporter for development debugging
    if (config.console?.enabled) {
      provider.addSpanProcessor(
        new SimpleSpanProcessor(new ConsoleSpanExporter()),
      );
    }

    // Register the provider globally
    provider.register();

    return provider;
  }

  /**
   * Start a new span
   */
  startSpan(name: string, attributes?: ConversationSpanAttributes): Span {
    const span = this.tracer.startSpan(name);

    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (value !== undefined) {
          span.setAttribute(key, value);
        }
      }
    }

    return span;
  }

  /**
   * Execute a function within a span
   */
  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes?: ConversationSpanAttributes,
  ): Promise<T> {
    const span = this.startSpan(name, attributes);

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        () => fn(span),
      );
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Get the underlying OpenTelemetry tracer
   */
  getTracer(): Tracer {
    return this.tracer;
  }

  /**
   * Extract trace context from HTTP headers
   */
  extractContext(
    headers: Record<string, string | undefined>,
  ): SpanContext | null {
    return extractTraceContext(headers);
  }

  /**
   * Inject trace context into HTTP headers
   */
  injectContext(): Record<string, string> {
    const span = trace.getActiveSpan();
    if (!span) {
      return {};
    }
    return injectTraceContext(span.spanContext());
  }

  /**
   * Get the current trace ID
   */
  getCurrentTraceId(): string | null {
    return getCurrentTraceId();
  }

  /**
   * Flush all pending spans
   */
  async flush(): Promise<void> {
    await this.provider.forceFlush();
  }
}
