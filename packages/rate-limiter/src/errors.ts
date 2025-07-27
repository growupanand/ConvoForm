import { RATE_LIMIT_ERROR_NAME } from "./types";

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for rate limit violations
 */
export class RateLimitError extends Error {
  public readonly resetTimeStamp: number;

  constructor(message: string, resetTimeStamp: number) {
    super(message);
    this.name = RATE_LIMIT_ERROR_NAME;
    this.resetTimeStamp = resetTimeStamp;

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}

/**
 * Type guard to check if an error is a rate limit error
 */
export const isRateLimitError = (error: unknown): error is RateLimitError => {
  return error instanceof Error && error.name === RATE_LIMIT_ERROR_NAME;
};
