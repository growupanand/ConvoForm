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

export const ratelimit = redis
  ? {
      core: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:core",
        limiter: Ratelimit.fixedWindow(2, "10s"),
      }),
    }
  : undefined;

export const checkRateLimit = async ({
  message,
  rateLimitType,
  identifier,
}: {
  identifier: string;
  message?: string;
  rateLimitType?: keyof typeof ratelimit;
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
  } = await ratelimit[rateLimitType ?? "core"].limit(identifier);

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
