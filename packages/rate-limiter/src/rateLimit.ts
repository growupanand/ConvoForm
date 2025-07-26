import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { timeAhead } from "./utils";

const isRateLimiterAvailable =
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  !!process.env.UPSTASH_REDIS_REST_URL;
if (!isRateLimiterAvailable) {
  if (process.env.SHOW_NO_RATE_LIMIT_LOG === undefined) {
    console.warn("=====> Rate limiter is not available");

    // This is to avoid showing the warning multiple times in development
    process.env.SHOW_NO_RATE_LIMIT_LOG = "true";
  }
}

const redis = isRateLimiterAvailable ? Redis.fromEnv() : undefined;

export type LimitType =
  | "common"
  | "core:create"
  | "core:edit"
  /** All OpenAI request called (except from loggedInUser or detected ip address of client)  */
  | "ai:unkown"
  /** All OpenAI request called by loggedInUser or detected ip address of client */
  | "ai:identified"
  | "file:upload";
type RateLimit = Record<LimitType, any>;

export const RATE_LIMIT_ERROR_NAME = "TOO_MANY_REQUESTS";

export const ratelimit = redis
  ? ({
      common: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit",
        limiter: Ratelimit.fixedWindow(200, "60s"),
      }),
      "core:create": new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:api",
        limiter: Ratelimit.fixedWindow(2, "10s"),
      }),
      "core:edit": new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:api",
        limiter: Ratelimit.fixedWindow(4, "10s"),
      }),
      "ai:unkown": new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:ai",
        limiter: Ratelimit.fixedWindow(400, "1d"),
      }),
      "ai:identified": new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:ai",
        limiter: Ratelimit.fixedWindow(150, "1d"),
      }),
      "file:upload": new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:api",
        limiter: Ratelimit.fixedWindow(1, "10s"),
      }),
    } as RateLimit)
  : undefined;

// Add a custom error class
export class RateLimitError extends Error {
  resetTimeStamp: number;

  constructor(message: string, resetTimeStamp: number) {
    super(message);
    this.name = RATE_LIMIT_ERROR_NAME;
    this.resetTimeStamp = resetTimeStamp;
  }
}

export const isRateLimitError = (error: Error): error is RateLimitError => {
  return error.name === RATE_LIMIT_ERROR_NAME;
};

/**
 * Check for rate limit and throw an error if the limit is exceeded.
 * @returns `Promise<void>`
 */
export const enforceRateLimit = async ({
  identifier,
  customErrorMessage,
  rateLimitType,
}: {
  /** A unique string value to identify user */
  identifier: string;
  /** Custom message to send in response */
  customErrorMessage?: string;
  /** Limit type E.g. `core`, `AI` etc */
  rateLimitType?: LimitType;
}) => {
  if (
    !redis ||
    typeof ratelimit === "undefined" ||
    Object.keys(ratelimit).length === 0
  ) {
    return;
  }

  const {
    success,
    /** Unix timestamp in milliseconds when the limits are reset. */
    reset: resetTimeStamp,
  } = await ratelimit[rateLimitType ?? "common"].limit(identifier);

  if (!success) {
    const errorMessage =
      customErrorMessage ??
      `Rate limit exceeded. Try again in ${timeAhead(resetTimeStamp)}.`;

    throw new RateLimitError(errorMessage, resetTimeStamp);
  }
};
