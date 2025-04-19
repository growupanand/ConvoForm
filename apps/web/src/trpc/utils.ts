import { isRateLimitErrorResponse } from "@convoform/rate-limiter";

export function ExtractFieldErrors(error: Record<string, any>) {
  if (typeof error !== "object" || error.name !== "TRPCClientError") {
    return {};
  }

  const fieldErrors = error.data?.zodError?.fieldErrors;
  if (!fieldErrors) {
    return {};
  }

  return fieldErrors;
}

export function getTRPCErrorMessage(err: Error) {
  const defaultErrorMessage = isRateLimitErrorResponse(err)
    ? "Too many requests"
    : "Something went wrong";
  return err.message ?? defaultErrorMessage;
}
