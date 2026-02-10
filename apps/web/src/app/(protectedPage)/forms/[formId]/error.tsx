"use client";

import { ErrorPage } from "@/components/common/errorPage";

export default function FormErrorBoundary({
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
      title="Form Error"
      description="We encountered an issue while loading this form. It might have been deleted or you may not have permission to view it."
    />
  );
}
