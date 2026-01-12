/**
 * Tracing Configuration
 *
 * Loads and validates tracer configuration from environment variables
 */

import { z } from "zod";
import type { TracerConfig } from "./types";

/**
 * Environment schema for tracer configuration
 */
const TracerEnvSchema = z.object({
  // Axiom configuration - unified with logger package
  // Falls back to legacy env vars for backwards compatibility
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_OTLP_TOKEN: z.string().optional(), // Legacy fallback
  AXIOM_DATASET: z.string().optional().default("convoform-dev"),
  AXIOM_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
  AXIOM_TRACING_ENABLED: z // Legacy fallback
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(true),

  // Console tracing (for development)
  TRACING_CONSOLE_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),

  // Environment
  NODE_ENV: z.string().optional().default("development"),
});

/**
 * Parse and validate tracer configuration from environment
 */
export function parseTracerConfig(
  serviceName: string,
  env: Record<string, string | undefined> = process.env,
): TracerConfig {
  try {
    const validatedEnv = TracerEnvSchema.parse(env);

    // Use unified env vars with fallback to legacy names
    const token = validatedEnv.AXIOM_TOKEN || validatedEnv.AXIOM_OTLP_TOKEN;
    const enabled =
      validatedEnv.AXIOM_ENABLED || validatedEnv.AXIOM_TRACING_ENABLED;

    return {
      serviceName,
      environment: validatedEnv.NODE_ENV,
      axiom: token
        ? {
            token,
            dataset: validatedEnv.AXIOM_DATASET,
            enabled,
          }
        : undefined,
      console: {
        enabled: validatedEnv.TRACING_CONSOLE_ENABLED,
      },
    };
  } catch (error) {
    console.warn("Failed to parse tracer config, using defaults:", error);
    return getDefaultConfig(serviceName);
  }
}

/**
 * Get default tracer configuration
 */
export function getDefaultConfig(serviceName: string): TracerConfig {
  return {
    serviceName,
    environment: process.env.NODE_ENV || "development",
    console: {
      enabled: false,
    },
  };
}

/**
 * Validate that required Axiom config is present if tracing is enabled
 */
export function validateAxiomConfig(config: TracerConfig): void {
  if (config.axiom?.enabled && !config.axiom?.token) {
    throw new Error(
      "Axiom tracing is enabled but AXIOM_TOKEN is not set. Please set AXIOM_TOKEN in your environment variables.",
    );
  }
}
