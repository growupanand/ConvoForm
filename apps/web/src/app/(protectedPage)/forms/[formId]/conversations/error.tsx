"use client";

import { ErrorPage } from "@/components/common/errorPage";

export default function ConversationsErrorBoundary({
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
      title="Conversations Error"
      description="We couldn't load the conversations for this form. Please try refreshing the page."
    />
  );
}
