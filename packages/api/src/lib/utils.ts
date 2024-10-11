import {
  type LimitType,
  RATE_LIMIT_ERROR_NAME,
  checkRateLimitThrowError,
  isRateLimitError,
} from "@convoform/rate-limiter";
import { TRPCError } from "@trpc/server";

export const getLastDaysDate = (lastDaysCount: number) => {
  const lastDaysDate = new Date();
  lastDaysDate.setDate(lastDaysDate.getDate() - lastDaysCount);
  return lastDaysDate;
};

/**
 * The function `getCurrentMonthDaysArray` returns an array of the days of the current month in
 * descending order.
 * @returns The function `getCurrentMonthDaysArray` returns an array of the days of the current month
 * in descending order.
 */
export const getCurrentMonthDaysArray = () => {
  const currentMonthTotalDays = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  // get array of day of lastDaysLength days,
  // E.g if today is 24 then [24, 23, 22, 21, 20, 19, 18]
  return Array.from(
    { length: currentMonthTotalDays },
    (_, i) => currentMonthTotalDays - i,
  );
};

export const checkRateLimitThrowTRPCError = async ({
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
  try {
    await checkRateLimitThrowError({
      identifier,
      message,
      rateLimitType,
    });
  } catch (error) {
    if (error instanceof Error && isRateLimitError(error)) {
      throw new TRPCError({
        code: RATE_LIMIT_ERROR_NAME,
        message: error.message,
        cause: error.cause,
      });
    }
    throw error;
  }
};
