import type { Ratelimit } from "@upstash/ratelimit";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

/**
 * Categories of rate limits for different API endpoints and operations
 */
export enum RateLimitCategory {
  /** General purpose rate limiting */
  COMMON = "common",
  /** Creating new resources (forms, etc.) */
  CORE_CREATE = "core:create",
  /** Editing existing resources */
  CORE_EDIT = "core:edit",
  /** AI requests from public sessions */
  AI_PUBLIC_SESSION = "ai:public-session",
  /** AI requests from logged in sessions */
  AI_PROTECTED_SESSION = "ai:protected-session",
  /** File upload operations */
  FILE_UPLOAD = "file:upload",
}

/**
 * Rate limit prefixes for different API endpoints and operations
 */
export enum RateLimitPrefix {
  /** Rate limit prefix for API requests */
  API = "ratelimit:api",
  /** Rate limit prefix for AI requests */
  AI = "ratelimit:ai",
  /** Rate limit prefix for file upload requests */
  FILE = "ratelimit:file",
}

/**
 * Rate limit configuration mapping
 */
export type RateLimitConfig = Record<RateLimitCategory, Ratelimit>;

/**
 * Error name constant for rate limit violations
 */
export const RATE_LIMIT_ERROR_NAME = "TOO_MANY_REQUESTS";
