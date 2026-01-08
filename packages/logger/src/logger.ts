/**
 * Logger Implementation
 *
 * Main logger class using Axiom and Console transports
 */

import { Axiom } from "@axiomhq/js";
import {
  AxiomJSTransport,
  Logger as AxiomLogger,
  ConsoleTransport,
} from "@axiomhq/logging";
import { Timer } from "./timer";
import type {
  ILogger,
  ITimer,
  LogContext,
  LogLevel,
  LoggerConfig,
} from "./types";

export class Logger implements ILogger {
  private axiomLogger: AxiomLogger;
  private config: LoggerConfig;
  private persistentContext: LogContext;

  constructor(config: LoggerConfig, persistentContext: LogContext = {}) {
    this.config = config;
    this.persistentContext = persistentContext;
    this.axiomLogger = this.createAxiomLogger(config);
  }

  /**
   * Create Axiom logger with configured transports
   */
  private createAxiomLogger(config: LoggerConfig): AxiomLogger {
    const transports: any[] = [];

    // Add Axiom transport if configured and enabled
    if (config.axiom?.token) {
      const axiom = new Axiom({
        token: config.axiom.token,
      });

      transports.push(
        new AxiomJSTransport({
          axiom,
          dataset: config.axiom.dataset,
          logLevel: "debug",
        }),
      );
    }

    // Add Console transport if enabled
    if (config.console?.enabled) {
      transports.push(
        new ConsoleTransport({
          prettyPrint: true,
          logLevel: "debug",
        }),
      );
    }

    // If no transports configured, add console as fallback
    if (transports.length === 0) {
      transports.push(
        new ConsoleTransport({
          prettyPrint: true,
          logLevel: "debug",
        }),
      );
    }

    return new AxiomLogger({
      transports: transports as [any, ...any[]],
    });
  }

  /**
   * Merge persistent context with log-specific context
   */
  private mergeContext(context?: LogContext): LogContext {
    return {
      ...this.persistentContext,
      ...context,
      // Add timestamp
      timestamp: new Date().toISOString(),
      // Add environment
      env: this.config.env,
    };
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(_level: LogLevel): boolean {
    // const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    // const configLevelIndex = levels.indexOf(this.config.level);
    // const logLevelIndex = levels.indexOf(level);

    // Currently i want to log all levels
    return true;
  }

  /**
   * Log info level message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      this.axiomLogger.info(message, this.mergeContext(context));
    }
  }

  /**
   * Log error level message
   */
  error(message: string, context?: LogContext): void {
    if (this.shouldLog("error")) {
      this.axiomLogger.error(message, this.mergeContext(context));
    }
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      this.axiomLogger.warn(message, this.mergeContext(context));
    }
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      this.axiomLogger.debug(message, this.mergeContext(context));
    }
  }

  /**
   * Start a performance timer
   */
  startTimer(operation: string, context?: LogContext): ITimer {
    const mergedContext = this.mergeContext(context);

    // Log timer start
    this.debug(`${operation} started`, {
      ...mergedContext,
      operation,
      timerStart: true,
    });

    return new Timer(operation, this, mergedContext);
  }

  /**
   * Create a child logger with persistent context
   */
  withContext(context: LogContext): ILogger {
    return new Logger(this.config, {
      ...this.persistentContext,
      ...context,
    });
  }
}
