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
