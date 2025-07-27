import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMIT_CONFIGS } from "./config";
import type { RateLimitCategory } from "./types";
import type { RateLimitConfig } from "./types";

// ============================================================================
// REDIS SETUP & INITIALIZATION
// ============================================================================

/**
 * Check if rate limiter dependencies are available
 */
const isRateLimiterAvailable =
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  !!process.env.UPSTASH_REDIS_REST_URL;

/**
 * Log warning if rate limiter is not available (only once in development)
 */
if (!isRateLimiterAvailable) {
  if (process.env.SHOW_NO_RATE_LIMIT_LOG === undefined) {
    console.warn(
      "⚠️  Rate limiter is not available - Redis credentials missing",
    );
    // Prevent multiple warnings in development
    process.env.SHOW_NO_RATE_LIMIT_LOG = "true";
  }
}

/**
 * Redis instance for rate limiting (undefined if not available)
 */
export const redis = isRateLimiterAvailable ? Redis.fromEnv() : undefined;

/**
 * Create rate limiter instance for a specific configuration
 */
const createRateLimiter = (
  redisInstance: Redis,
  config: (typeof RATE_LIMIT_CONFIGS)[RateLimitCategory],
): Ratelimit => {
  return new Ratelimit({
    redis: redisInstance,
    analytics: true,
    prefix: config.prefix,
    limiter: Ratelimit.fixedWindow(config.requests, config.window),
  });
};

/**
 * Rate limiter instances mapped by rate limit category
 * Only created if Redis is available
 */
export const ratelimit: RateLimitConfig | undefined = redis
  ? Object.entries(RATE_LIMIT_CONFIGS).reduce((acc, [key, config]) => {
      acc[key as RateLimitCategory] = createRateLimiter(redis, config);
      return acc;
    }, {} as RateLimitConfig)
  : undefined;
