"use client";

import { api } from "@/trpc/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  toast,
} from "@convoform/ui";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";

type Props = {
  formId: string;
  onCreated: (payload: { secret: string; endpointUrl: string }) => void;
  disabled?: boolean;
};

/**
 * Add-endpoint dialog. The first step asks for the destination URL; the
 * caller shows the one-time secret dialog after a successful create.
 */
export function AddWebhookEndpointDialog({
  formId,
  onCreated,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const createMutation = api.webhookEndpoint.create.useMutation({
    onSuccess: (data) => {
      toast.success("Webhook endpoint created");
      setOpen(false);
      setUrl("");
      onCreated({ secret: data.secret, endpointUrl: data.endpoint.url });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = useCallback(() => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      toast.error("Enter the URL that should receive webhooks");
      return;
    }

    try {
      const parsed = new URL(trimmedUrl);
      const isLocalhost =
        parsed.hostname === "localhost" ||
        parsed.hostname.endsWith(".localhost") ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "[::1]";

      if (parsed.protocol !== "https:" && !isLocalhost) {
        toast.error("Use an https URL (http is only allowed for localhost)");
        return;
      }
    } catch {
      toast.error("Enter a valid URL");
      return;
    }

    createMutation.mutate({ formId, url: trimmedUrl });
  }, [createMutation, formId, url]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Plus className="mr-2 size-4" />
          Add endpoint
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add webhook endpoint</DialogTitle>
          <DialogDescription>
            ConvoForm sends a signed POST request to this URL whenever a
            response is completed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="webhook-endpoint-url">Endpoint URL</Label>
            <Input
              id="webhook-endpoint-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/webhooks/convoform"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
            <p className="text-muted-foreground text-xs">
              Must be a public HTTPS URL. Private, loopback and cloud metadata
              addresses are rejected. Redirects are not followed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!url.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Validating..." : "Add endpoint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
