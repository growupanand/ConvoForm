/**
 * Server-side Trace Ingestion Handler
 *
 * Framework-agnostic handler for proxying browser trace data to Axiom.
 * This allows browser clients to send traces without exposing Axiom credentials.
 */

/**
 * Axiom OTLP endpoint for traces
 */
const AXIOM_OTLP_ENDPOINT = "https://api.axiom.co/v1/traces";

/**
 * Configuration for the trace ingestion handler
 */
export interface TraceIngestConfig {
  /**
   * Axiom API token for authentication
   */
  axiomToken: string;

  /**
   * Axiom dataset to send traces to
   * @default "convoform-dev"
   */
  axiomDataset?: string;
}

/**
 * Result from the trace ingestion handler
 */
export interface TraceIngestResult {
  status: number;
  data: { success: true } | { error: string };
}

/**
 * Create a trace ingestion handler that forwards traces to Axiom.
 *
 * This is a framework-agnostic handler that can be used with any server framework.
 * The handler accepts the raw request body and returns a result object.
 *
 * @example
 * ```typescript
 * // Next.js App Router
 * import { createTraceIngestHandler } from "@convoform/tracing";
 *
 * const handler = createTraceIngestHandler({
 *   axiomToken: process.env.AXIOM_TOKEN!,
 *   axiomDataset: process.env.AXIOM_DATASET,
 * });
 *
 * export async function POST(req: NextRequest) {
 *   const body = await req.json();
 *   const result = await handler(body);
 *   return NextResponse.json(result.data, { status: result.status });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Express.js
 * import { createTraceIngestHandler } from "@convoform/tracing";
 *
 * const handler = createTraceIngestHandler({
 *   axiomToken: process.env.AXIOM_TOKEN!,
 * });
 *
 * app.post("/api/traces", async (req, res) => {
 *   const result = await handler(req.body);
 *   res.status(result.status).json(result.data);
 * });
 * ```
 */
export function createTraceIngestHandler(config: TraceIngestConfig) {
  const { axiomToken, axiomDataset = "convoform-dev" } = config;

  return async (body: unknown): Promise<TraceIngestResult> => {
    if (!axiomToken) {
      console.error("AXIOM_TOKEN is not defined");
      return {
        status: 500,
        data: { error: "Tracing configuration missing" },
      };
    }

    try {
      const response = await fetch(AXIOM_OTLP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${axiomToken}`,
          "X-Axiom-Dataset": axiomDataset,
          "User-Agent": "convoform-proxy",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Axiom ingestion failed:", response.status, text);
        return {
          status: response.status,
          data: { error: "Failed to ingest traces" },
        };
      }

      return {
        status: 200,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error processing trace request:", error);
      return {
        status: 500,
        data: { error: "Internal server error" },
      };
    }
  };
}
