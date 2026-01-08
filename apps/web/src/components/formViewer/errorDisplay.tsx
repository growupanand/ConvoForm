"use client";

import { Button } from "@convoform/ui";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  error: Error;
  onRetry: () => void;
  fontColor?: string;
}

/**
 * Displays a user-friendly error message when conversation errors occur
 * Handles rate limit errors with specific messaging
 */
export function ErrorDisplay({ error, onRetry, fontColor }: ErrorDisplayProps) {
  // Check if this looks like a rate limit error
  const isRateLimitError =
    error.message.includes("rate limit") ||
    error.message.includes("Rate limit") ||
    error.message.includes("429") ||
    error.message.includes("Too Many Requests");

  const title = isRateLimitError
    ? "We're experiencing high demand"
    : "Something went wrong";

  const message = isRateLimitError
    ? "Our AI service is temporarily busy. Please wait a moment and try again."
    : "There was an error processing your request. Please try again.";

  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full p-8 text-center"
      style={{ color: fontColor }}
    >
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <Button onClick={onRetry} variant="outline" size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        {/* Show technical error in development */}
        {process.env.NODE_ENV === "development" && (
          <details className="text-xs text-muted-foreground mt-4 max-w-full">
            <summary className="cursor-pointer">Technical details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto max-w-full">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
