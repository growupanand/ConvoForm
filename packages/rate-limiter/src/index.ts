// ============================================================================
// MAIN EXPORTS
// ============================================================================

// Core rate limiting functionality
export { enforceRateLimit } from "./enforcement";

// Types and enums
export { RateLimitCategory, RATE_LIMIT_ERROR_NAME } from "./types";
export type { RateLimitConfig } from "./types";

// Error handling
export { RateLimitError, isRateLimitError } from "./errors";

// Configuration (for advanced usage)
export { RATE_LIMIT_CONFIGS } from "./config";

// Redis instances (for testing/debugging)
export { redis, ratelimit } from "./redis";
