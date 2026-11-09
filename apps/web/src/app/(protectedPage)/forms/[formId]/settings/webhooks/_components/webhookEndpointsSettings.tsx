"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@convoform/ui";
import { Webhook } from "lucide-react";
import { useCallback, useState } from "react";
import { AddWebhookEndpointDialog } from "./addWebhookEndpointDialog";
import { WebhookEndpointCard } from "./webhookEndpointCard";
import { WebhookSecretDialog } from "./webhookSecretDialog";

const MAX_ENABLED_ENDPOINTS_PER_FORM = 10;

type RevealedSecret = {
  secret: string;
  endpointUrl: string;
};

export default function WebhookEndpointsSettings({
  formId,
}: { formId: string }) {
  const {
    data: endpoints,
    isLoading,
    refetch,
  } = api.webhookEndpoint.list.useQuery(
    { formId },
    { refetchOnMount: true, refetchOnWindowFocus: true },
  );

  const [revealedSecret, setRevealedSecret] = useState<RevealedSecret | null>(
    null,
  );

  const handleSecretRevealed = useCallback((payload: RevealedSecret) => {
    setRevealedSecret(payload);
  }, []);

  const handleCreated = useCallback(
    (payload: RevealedSecret) => {
      refetch();
      handleSecretRevealed(payload);
    },
    [handleSecretRevealed, refetch],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {["endpoint-skeleton-1", "endpoint-skeleton-2"].map((key) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const enabledCount =
    endpoints?.filter(
      (endpoint) => endpoint.enabled && endpoint.disabledAt == null,
    ).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">
            Send a signed <code className="font-mono">response.completed</code>{" "}
            event to your own URL. Works with Zapier, Make and n8n catch hooks.
          </p>
          <p className="text-muted-foreground text-xs">
            {enabledCount} of {MAX_ENABLED_ENDPOINTS_PER_FORM} enabled endpoints
            used on this form.
          </p>
        </div>
        <AddWebhookEndpointDialog
          formId={formId}
          onCreated={handleCreated}
          disabled={enabledCount >= MAX_ENABLED_ENDPOINTS_PER_FORM}
        />
      </div>

      {enabledCount >= MAX_ENABLED_ENDPOINTS_PER_FORM && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          This form has reached the beta limit of{" "}
          {MAX_ENABLED_ENDPOINTS_PER_FORM} enabled endpoints. Disable or delete
          one before adding another.
        </div>
      )}

      {endpoints?.length ? (
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <WebhookEndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              onRefetch={refetch}
              onSecretRevealed={handleSecretRevealed}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-violet-100 p-2">
                <Webhook className="size-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>No webhook endpoints yet</CardTitle>
                <CardDescription>
                  Add an endpoint to start sending completed responses to your
                  own service. Each delivery is signed and retried
                  automatically.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Read the{" "}
              <a
                href="https://docs.convoform.com/concepts/integrations/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                webhook docs
              </a>{" "}
              for payload examples and signature verification snippets.
            </p>
          </CardContent>
        </Card>
      )}

      <WebhookSecretDialog
        open={revealedSecret != null}
        onOpenChange={(open) => {
          if (!open) {
            setRevealedSecret(null);
          }
        }}
        secret={revealedSecret?.secret ?? ""}
        endpointUrl={revealedSecret?.endpointUrl}
      />
    </div>
  );
}
