import type { AppRouter } from "@convoform/api";
import type { TRPCClientError } from "@trpc/client";

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

export const isTRPCRateLimitError = (trpcError: TRPCClientError<AppRouter>) => {
  return trpcError.data && "rateLimitError" in trpcError.data;
};

export function isTRPCZODError(trpcError: TRPCClientError<AppRouter>) {
  return trpcError.data && "zodError" in trpcError.data;
}

export function getTRPCErrorMessage(err: TRPCClientError<AppRouter>) {
  if (isTRPCZODError(err)) {
    const customErrors = err.data?.zodError?.formErrors;
    if (customErrors && customErrors?.length > 0) {
      err.message = customErrors.join("\n");
    }
  }

  return err.message ?? "Server error";
}
