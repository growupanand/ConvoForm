import { RateLimitCategory, RateLimitPrefix } from "./types";

// ============================================================================
// RATE LIMIT CONFIGURATIONS
// ============================================================================

/**
 * Rate limit configurations for different operation types
 * Each configuration specifies the number of requests allowed within a time window
 */
export const RATE_LIMIT_CONFIGS = {
  [RateLimitCategory.COMMON]: {
    requests: 200,
    window: "60s",
    prefix: RateLimitPrefix.API,
    description: "General API requests",
  },
  [RateLimitCategory.CORE_CREATE]: {
    requests: 2,
    window: "10s",
    prefix: RateLimitPrefix.API,
    description: "Resource creation operations",
  },
  [RateLimitCategory.CORE_EDIT]: {
    requests: 4,
    window: "10s",
    prefix: RateLimitPrefix.API,
    description: "Resource editing operations",
  },
  [RateLimitCategory.AI_PUBLIC_SESSION]: {
    requests: 400,
    window: "1d",
    prefix: RateLimitPrefix.AI,
    description: "AI requests from unidentified users",
  },
  [RateLimitCategory.AI_PROTECTED_SESSION]: {
    requests: 150,
    window: "1d",
    prefix: RateLimitPrefix.AI,
    description: "AI requests from authenticated users",
  },
  [RateLimitCategory.FILE_UPLOAD]: {
    requests: 1,
    window: "10s",
    prefix: RateLimitPrefix.FILE,
    description: "File upload operations",
  },
} as const;
