"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { NotFoundPage } from "@/components/common/notFound";

export default function GlobalError({ error }: { error: any }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
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
