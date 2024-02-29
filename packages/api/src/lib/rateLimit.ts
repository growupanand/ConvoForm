import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { getRemainingSeconds } from "./utils";

const isRateLimiterAvailable =
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  !!process.env.UPSTASH_REDIS_REST_URL;
if (!isRateLimiterAvailable) {
  console.warn("Rate limiter is not available");
}

const redis = isRateLimiterAvailable ? Redis.fromEnv() : undefined;

type LimitType = "common" | "core:create";
type RateLimit = Record<LimitType, any>;

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
    const remainingSeconds = getRemainingSeconds(resetTimeStamp);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        typeof message === "string"
          ? message
          : `Rate limit exceeded. Try again in ${remainingSeconds} seconds.`,
      cause: {
        resetTimeStamp,
        remainingSeconds,
      },
    });
  }
};
