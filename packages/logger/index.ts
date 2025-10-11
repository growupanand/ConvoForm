/**
 * @convoform/logger
 *
 * Generic logging package for ConvoForm with Axiom integration
 */

import {
  getDefaultConfig,
  parseLoggerConfig,
  validateAxiomConfig,
} from "./src/config";
import { Logger } from "./src/logger";
import type { ILogger, LogContext, LoggerConfig } from "./src/types";

// Export types
export type {
  ILogger,
  ITimer,
  LogContext,
  LoggerConfig,
  LogLevel,
} from "./src/types";

// Singleton instance
let loggerInstance: ILogger | null = null;

/**
 * Create a new logger instance with custom configuration
 */
export function createLogger(config?: Partial<LoggerConfig>): ILogger {
  const fullConfig = config
    ? { ...getDefaultConfig(), ...config }
    : parseLoggerConfig();

  // Validate Axiom config if enabled
  if (fullConfig.axiom?.enabled) {
    validateAxiomConfig(fullConfig);
  }

  return new Logger(fullConfig);
}

/**
 * Get or create singleton logger instance
 * Uses environment variables for configuration
 */
export function getLogger(): ILogger {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}

/**
 * Create a logger with conversation context
 * Convenience function for AI package
 */
export function createConversationLogger(context: LogContext): ILogger {
  return getLogger().withContext(context);
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetLogger(): void {
  loggerInstance = null;
}

// Default export
export default {
  createLogger,
  getLogger,
  createConversationLogger,
  resetLogger,
  Logger,
};

export { Logger };
