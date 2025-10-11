/**
 * Logger Configuration
 *
 * Loads and validates logger configuration from environment variables
 */

import { z } from "zod";
import type { LogLevel, LoggerConfig } from "./types";

/**
 * Environment schema for logger configuration
 */
const LoggerEnvSchema = z.object({
  // Log level
  LOGGER_LEVEL: z
    .enum(["debug", "info", "warn", "error", "off"])
    .optional()
    .default("debug"),

  // Axiom configuration
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
  AXIOM_ENABLED: z
    .string()
    .optional()
    .transform((val: string) => val === "true")
    .default("false"),

  // Console configuration
  LOGGER_CONSOLE_ENABLED: z
    .string()
    .optional()
    .transform((val: string) => val !== "false") // Enabled by default
    .default("true"),

  // Environment
  NODE_ENV: z.string().optional().default("development"),
});

/**
 * Parse and validate logger configuration from environment
 */
export function parseLoggerConfig(
  env: Record<string, string | undefined> = process.env,
): LoggerConfig {
  try {
    const validatedEnv = LoggerEnvSchema.parse(env);

    return {
      level: validatedEnv.LOGGER_LEVEL as LogLevel,
      axiom: validatedEnv.AXIOM_TOKEN
        ? {
            token: validatedEnv.AXIOM_TOKEN,
            dataset: validatedEnv.AXIOM_DATASET || "convoform-logs",
            enabled: validatedEnv.AXIOM_ENABLED,
          }
        : undefined,
      console: {
        enabled: validatedEnv.LOGGER_CONSOLE_ENABLED,
      },
      env: validatedEnv.NODE_ENV,
    };
  } catch (error) {
    // If validation fails, return safe defaults
    console.warn("Failed to parse logger config, using defaults:", error);
    return getDefaultConfig();
  }
}

/**
 * Get default logger configuration
 */
export function getDefaultConfig(): LoggerConfig {
  return {
    level: "info",
    console: {
      enabled: true,
    },
    env: process.env.NODE_ENV || "development",
  };
}

/**
 * Validate that required Axiom config is present if Axiom is enabled
 */
export function validateAxiomConfig(config: LoggerConfig): void {
  if (config.axiom?.enabled && !config.axiom?.token) {
    throw new Error(
      "Axiom is enabled but AXIOM_TOKEN is not set. Please set AXIOM_TOKEN in your environment variables.",
    );
  }
}
