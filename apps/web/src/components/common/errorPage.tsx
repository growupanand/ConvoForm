"use client";

import { Button } from "@convoform/ui";
import { useEffect } from "react";
import { NotFoundPage } from "./notFound";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorPage({
  error,
  reset,
  title = "Something went wrong!",
  description = "We apologize for the inconvenience. Please try again.",
}: ErrorPageProps) {
  useEffect(() => {
    // Log the error to console
    console.error(error);
  }, [error]);

  return (
    <NotFoundPage
      code={500}
      title={title}
      description={description}
      action={
        <div className="flex gap-4 mt-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      }
    />
  );
}
