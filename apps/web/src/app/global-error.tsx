"use client"; // Error boundaries must be Client Components

import { NotFoundPage } from "@/components/common/notFound";
import posthog from "posthog-js";
import { useEffect } from "react";

export default function GlobalError({
  error,
  // reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    // biome-ignore lint/a11y/useHtmlLang: <explanation>
    <html>
      <body>
        <NotFoundPage
          code={500}
          title="Sorry, it's not you, it's us."
          description="We will figure it out!"
        />
      </body>
    </html>
  );
}
