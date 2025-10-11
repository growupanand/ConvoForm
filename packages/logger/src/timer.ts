/**
 * Timer Implementation
 *
 * Tracks performance with incremental checkpoints
 */

import type { ILogger, ITimer, LogContext } from "./types";

export class Timer implements ITimer {
  private startTime: number;
  private lastCheckpointTime: number;
  private operation: string;
  private context: LogContext;
  private logger: ILogger;
  private checkpointCount: number;

  constructor(operation: string, logger: ILogger, context: LogContext = {}) {
    this.operation = operation;
    this.logger = logger;
    this.context = context;
    this.startTime = performance.now();
    this.lastCheckpointTime = this.startTime;
    this.checkpointCount = 0;
  }

  /**
   * Log a checkpoint with incremental time since last checkpoint
   */
  checkpoint(name: string, additionalContext?: LogContext): number {
    const now = performance.now();
    const timeSinceStart = now - this.startTime;
    const timeSinceLastCheckpoint = now - this.lastCheckpointTime;

    this.checkpointCount++;

    // Log checkpoint with incremental timing
    this.logger.debug(`${this.operation} → ${name}`, {
      ...this.context,
      ...additionalContext,
      checkpoint: name,
      checkpointNumber: this.checkpointCount,
      timeSinceStart: Math.round(timeSinceStart * 100) / 100,
      timeSinceLastCheckpoint: Math.round(timeSinceLastCheckpoint * 100) / 100,
      duration: Math.round(timeSinceLastCheckpoint * 100) / 100, // Incremental duration
    });

    // Update last checkpoint time
    this.lastCheckpointTime = now;

    return timeSinceLastCheckpoint;
  }

  /**
   * End the timer and log final duration
   */
  end(additionalContext?: LogContext): number {
    const now = performance.now();
    const totalDuration = now - this.startTime;
    const timeSinceLastCheckpoint = now - this.lastCheckpointTime;

    // Log final timing
    this.logger.info(`${this.operation} completed`, {
      ...this.context,
      ...additionalContext,
      duration: Math.round(totalDuration * 100) / 100,
      timeSinceLastCheckpoint: Math.round(timeSinceLastCheckpoint * 100) / 100,
      totalCheckpoints: this.checkpointCount,
      operation: this.operation,
    });

    return totalDuration;
  }

  /**
   * Get elapsed time without logging
   */
  getElapsed(): number {
    return performance.now() - this.startTime;
  }
}
