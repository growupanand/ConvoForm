import { RateLimitError } from "./errors";
import { ratelimit, redis } from "./redis";
import { RateLimitCategory } from "./types";
import { timeAhead } from "./utils";

// ============================================================================
// RATE LIMITING ENFORCEMENT
// ============================================================================

/**
 * Internal helper function to enforce rate limiting
 */
const enforceRateLimitInternal = async (
  identifier: string | undefined,
  category: RateLimitCategory,
  customErrorMessage?: string,
): Promise<void> => {
  // Skip rate limiting if Redis is not available
  if (!redis || !ratelimit) {
    return;
  }

  // Use default identifier if none provided
  const finalIdentifier = identifier ?? "anonymous";

  // Get the appropriate rate limiter
  const limiter = ratelimit[category];
  if (!limiter) {
    console.warn(`⚠️  Unknown rate limit category: ${category}`);
    return;
  }

  // Check rate limit and throw error if exceeded
  const { success, reset: resetTimeStamp } =
    await limiter.limit(finalIdentifier);

  if (!success) {
    const defaultMessage = `Rate limit exceeded. Try again in ${timeAhead(resetTimeStamp)}.`;
    const errorMessage = customErrorMessage ?? defaultMessage;

    throw new RateLimitError(errorMessage, resetTimeStamp);
  }
};

/**
 * Method-based rate limiting API
 * Each category has its own method for cleaner usage
 *
 * @example
 * ```typescript
 * // General rate limiting with identifier
 * await enforceRateLimit.COMMON("user_123");
 *
 * // Anonymous rate limiting (uses "anonymous" as identifier)
 * await enforceRateLimit.AI_PUBLIC_SESSION();
 *
 * // With identifier and custom error message
 * await enforceRateLimit.AI_PROTECTED_SESSION(
 *   "user_123",
 *   "Too many AI requests. Please wait."
 * );
 *
 * // Anonymous with custom error message
 * await enforceRateLimit.AI_PUBLIC_SESSION(
 *   undefined,
 *   "Custom error for anonymous users"
 * );
 * ```
 */
export const enforceRateLimit = {
  /**
   * General purpose rate limiting (200 requests per 60 seconds)
   * @param identifier - Optional unique identifier for the user/client (defaults to "anonymous")
   * @param customErrorMessage - Optional custom error message
   */
  COMMON: async (
    identifier?: string,
    customErrorMessage?: string,
  ): Promise<void> => {
    return enforceRateLimitInternal(
      identifier,
      RateLimitCategory.COMMON,
      customErrorMessage,
    );
  },

  /**
   * Rate limiting for resource creation operations (2 requests per 10 seconds)
   * @param identifier - Optional unique identifier for the user/client (defaults to "anonymous")
   * @param customErrorMessage - Optional custom error message
   */
  CORE_CREATE: async (
    identifier?: string,
    customErrorMessage?: string,
  ): Promise<void> => {
    return enforceRateLimitInternal(
      identifier,
      RateLimitCategory.CORE_CREATE,
      customErrorMessage,
    );
  },

  /**
   * Rate limiting for resource editing operations (4 requests per 10 seconds)
   * @param identifier - Optional unique identifier for the user/client (defaults to "anonymous")
   * @param customErrorMessage - Optional custom error message
   */
  CORE_EDIT: async (
    identifier?: string,
    customErrorMessage?: string,
  ): Promise<void> => {
    return enforceRateLimitInternal(
      identifier,
      RateLimitCategory.CORE_EDIT,
      customErrorMessage,
    );
  },

  /**
   * Rate limiting for AI requests from public sessions (400 requests per day)
   * @param identifier - Optional unique identifier for the user/client (defaults to "anonymous")
   * @param customErrorMessage - Optional custom error message
   */
  AI_PUBLIC_SESSION: async (
    identifier?: string,
    customErrorMessage?: string,
  ): Promise<void> => {
    return enforceRateLimitInternal(
      identifier,
      RateLimitCategory.AI_PUBLIC_SESSION,
      customErrorMessage,
    );
  },

  /**
   * Rate limiting for AI requests from authenticated sessions (150 requests per day)
   * @param identifier - Optional unique identifier for the user/client (defaults to "anonymous")
   * @param customErrorMessage - Optional custom error message
   */
  AI_PROTECTED_SESSION: async (
    identifier?: string,
    customErrorMessage?: string,
  ): Promise<void> => {
    return enforceRateLimitInternal(
      identifier,
      RateLimitCategory.AI_PROTECTED_SESSION,
      customErrorMessage,
    );
  },

  /**
   * Rate limiting for file upload operations (1 request per 10 seconds)
   * @param identifier - Optional unique identifier for the user/client (defaults to "anonymous")
   * @param customErrorMessage - Optional custom error message
   */
  FILE_UPLOAD: async (
    identifier?: string,
    customErrorMessage?: string,
  ): Promise<void> => {
    return enforceRateLimitInternal(
      identifier,
      RateLimitCategory.FILE_UPLOAD,
      customErrorMessage,
    );
  },
} as const;
