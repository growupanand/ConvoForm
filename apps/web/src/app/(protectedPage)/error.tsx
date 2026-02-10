"use client";

import { ErrorPage } from "@/components/common/errorPage";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="Application Error"
      description="An unexpected error occurred while loading the application."
    />
  );
}
