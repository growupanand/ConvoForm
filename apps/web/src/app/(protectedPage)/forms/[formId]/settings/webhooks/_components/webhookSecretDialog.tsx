"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from "@convoform/ui";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { useCallback, useState } from "react";
import { NODE_WEBHOOK_VERIFICATION_SNIPPET } from "./webhookVerificationSnippet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secret: string;
  endpointUrl?: string;
};

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Could not copy to clipboard");
  }
}

function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  }, [value]);

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
      {copied ? (
        <Check className="mr-2 size-4" />
      ) : (
        <Copy className="mr-2 size-4" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}

/**
 * Shows a signing secret exactly once after creation or rotation, together
 * with a ready-to-paste verification snippet.
 */
export function WebhookSecretDialog({
  open,
  onOpenChange,
  secret,
  endpointUrl,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save your signing secret</DialogTitle>
          <DialogDescription>
            ConvoForm uses this secret to sign every request. It will not be
            shown again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertTitle>Copy it now</AlertTitle>
            <AlertDescription>
              Store this secret in your environment as{" "}
              <code className="font-mono">CONVOFORM_WEBHOOK_SECRET</code>. If
              you lose it, rotate the secret from the endpoint menu.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Signing secret</span>
              <CopyButton value={secret} label="Copy secret" />
            </div>
            <code className="block break-all rounded-md bg-muted p-3 font-mono text-xs">
              {secret}
            </code>
          </div>

          {endpointUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Endpoint URL</span>
                <CopyButton value={endpointUrl} label="Copy URL" />
              </div>
              <code className="block break-all rounded-md bg-muted p-3 font-mono text-xs">
                {endpointUrl}
              </code>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                Verify it in a Next.js route handler
              </span>
              <CopyButton
                value={NODE_WEBHOOK_VERIFICATION_SNIPPET}
                label="Copy snippet"
              />
            </div>
            <pre className="max-h-72 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
              {NODE_WEBHOOK_VERIFICATION_SNIPPET}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            I saved the secret
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
