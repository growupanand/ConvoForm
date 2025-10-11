/**
 * Client-Side Logger for Next.js
 *
 * Creates a logger instance that works in the browser using NEXT_PUBLIC_ prefixed
 * environment variables. This is used in client components like useConvoForm.
 */

import { type ILogger, Logger } from "@convoform/logger";

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
