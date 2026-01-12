/**
 * Client-Side Logger and Tracer for Next.js
 *
 * Creates logger and tracer instances that work in the browser using NEXT_PUBLIC_ prefixed
 * environment variables. This is used in client components like useConvoForm.
 */

import { type ILogger, Logger } from "@convoform/logger";
import {
  EdgeTracer,
  type EdgeTracer as IEdgeTracer,
  createBrowserTracer,
} from "@convoform/tracing";

/**
 * Create a client-side tracer instance for use in React components
 * Uses NEXT_PUBLIC_ prefixed environment variables for browser access
 *
 * Unlike createBrowserTracer (which uses a proxy endpoint), this tracer
 * sends traces directly to Axiom using the public token.
 *
 * @param serviceName - Name of the service for tracing identification
 */
export function createNextjsTracer(serviceName: string): IEdgeTracer {
  // In development, use browser tracer which sends to proxy endpoint to avoid CORS issues
  if (process.env.NODE_ENV === "development") {
    return createBrowserTracer(serviceName);
  }

  const axiomToken = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
  const axiomDataset = process.env.NEXT_PUBLIC_AXIOM_DATASET;

  return new EdgeTracer({
    serviceName,
    axiomToken,
    axiomDataset: axiomDataset || "convoform-dev",
    // Enable only if we have a token (production), otherwise disabled
    enabled: !!axiomToken,
  });
}

/**
 * Create a client-side logger instance for use in React components
 * Uses NEXT_PUBLIC_ prefixed environment variables for browser access
 */
export function createNextjsLogger(): ILogger {
  // Axiom config (optional, for production monitoring)
  const axiomToken = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
  const axiomDataset = process.env.NEXT_PUBLIC_AXIOM_DATASET;

  console.log("creating client logger", {
    axiomToken,
    axiomDataset,
    enabled: process.env.NODE_ENV !== "production",
  });

  return new Logger({
    level: "debug",
    console: {
      enabled: process.env.NODE_ENV !== "production",
    },
    axiom:
      axiomToken && axiomDataset
        ? {
            token: axiomToken,
            dataset: axiomDataset,
            enabled: true,
          }
        : undefined,
    env: process.env.NODE_ENV || "development",
  });
}
