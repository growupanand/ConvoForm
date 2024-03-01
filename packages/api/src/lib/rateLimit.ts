import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { timeAhead } from "./utils";

const isRateLimiterAvailable =
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  !!process.env.UPSTASH_REDIS_REST_URL;
if (!isRateLimiterAvailable) {
  console.warn("Rate limiter is not available");
}

const redis = isRateLimiterAvailable ? Redis.fromEnv() : undefined;

type LimitType =
  | "common"
  | "core:create"
  | "core:edit"
  | "ai:unkown"
  | "ai:identified";
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
      ["core:create"]: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:api",
        limiter: Ratelimit.fixedWindow(2, "10s"),
      }),
      ["core:edit"]: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:api",
        limiter: Ratelimit.fixedWindow(4, "10s"),
      }),
      ["ai:unkown"]: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:ai",
        limiter: Ratelimit.fixedWindow(300, "1d"),
      }),
      ["ai:identified"]: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:ai",
        limiter: Ratelimit.fixedWindow(100, "1d"),
      }),
    } as RateLimit)
  : undefined;

/**
 * Check for rate limit and throw an error if the limit is exceeded.
 * @returns `Promise<void>`
 */
export const checkRateLimit = async ({
  identifier,
  message,
  rateLimitType,
}: {
  /** A unique string value to identify user */
  identifier: string;
  /** Custom message to send in response */
  message?: string;
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
      typeof message === "string"
        ? message
        : `Rate limit exceeded. Try again in ${timeAhead(resetTimeStamp)}.`;
    const error = new Error(errorMessage);
    error.name = RATE_LIMIT_ERROR_NAME;
    error.cause = {
      resetTimeStamp,
    };
    throw error;
  }
};

export const isRateLimitError = (error: any) => {
  return error.name === RATE_LIMIT_ERROR_NAME;
};
