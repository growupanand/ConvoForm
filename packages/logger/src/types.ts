/**
 * Logger Types
 *
 * Provider-agnostic logging interfaces for ConvoForm
 */

/**
 * Log context - metadata attached to every log entry
 */
export interface LogContext {
  conversationId?: string;
  formId?: string;
  organizationId?: string;
  fieldId?: string;
  fieldType?: string;
  checkpoint?: string;
  duration?: number;
  timeSinceStart?: number;
  timeSinceLastCheckpoint?: number;
  [key: string]: any; // Allow custom fields
}

/**
 * Log level types
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Timer interface for performance tracking
 */
export interface ITimer {
  /**
   * Log a checkpoint with incremental time since last checkpoint
   */
  checkpoint(name: string, additionalContext?: LogContext): number;

  /**
   * End the timer and log final duration
   */
  end(additionalContext?: LogContext): number;

  /**
   * Get elapsed time without logging
   */
  getElapsed(): number;
}

/**
 * Main logger interface (provider-agnostic)
 */
export interface ILogger {
  /**
   * Log info level message
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log error level message
   */
  error(message: string, context?: LogContext): void;

  /**
   * Log warning level message
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log debug level message
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Start a performance timer
   */
  startTimer(operation: string, context?: LogContext): ITimer;

  /**
   * Create a child logger with persistent context
   */
  withContext(context: LogContext): ILogger;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  // Log level
  level: LogLevel;

  // Axiom configuration
  axiom?: {
    token: string;
    dataset: string;
    enabled: boolean;
  };

  // Console configuration
  console?: {
    enabled: boolean;
  };

  // Environment
  env?: string;
}

/**
 * Transport interface for custom implementations
 */
export interface ITransport {
  log(level: LogLevel, message: string, context: LogContext): void;
}
