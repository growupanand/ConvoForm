"use client";

import { ConfirmAction } from "@/components/common/confirmAction";
import { api } from "@/trpc/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
  toast,
} from "@convoform/ui";
import { RefreshCw, ScrollText, Send, Trash2, Webhook } from "lucide-react";
import { useState } from "react";
import { WebhookDeliveryLogDialog } from "./webhookDeliveryLogDialog";

export type WebhookEndpointSummary = {
  id: string;
  url: string;
  enabled: boolean;
  consecutiveFailures: number;
  disabledAt: Date | string | null;
  disabledReason: string | null;
};

type Props = {
  endpoint: WebhookEndpointSummary;
  onRefetch: () => void;
  onSecretRevealed: (payload: { secret: string; endpointUrl: string }) => void;
};

/**
 * One endpoint card: status, enable toggle, test delivery, secret rotation,
 * deletion and the delivery log.
 */
export function WebhookEndpointCard({
  endpoint,
  onRefetch,
  onSecretRevealed,
}: Props) {
  const [logOpen, setLogOpen] = useState(false);
  const isAutoDisabled = endpoint.disabledAt != null;
  const isActive = endpoint.enabled && !isAutoDisabled;

  const setEnabledMutation = api.webhookEndpoint.setEnabled.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(
        variables.enabled ? "Endpoint enabled" : "Endpoint disabled",
      );
      onRefetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const sendTestMutation = api.webhookEndpoint.sendTest.useMutation({
    onSuccess: () => {
      toast.success("Test delivery queued");
      setLogOpen(true);
    },
    onError: (error) => toast.error(error.message),
  });

  const rotateSecretMutation = api.webhookEndpoint.rotateSecret.useMutation({
    onSuccess: (data) => {
      toast.success("Signing secret rotated");
      onSecretRevealed({ secret: data.secret, endpointUrl: endpoint.url });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = api.webhookEndpoint.delete.useMutation({
    onSuccess: () => {
      toast.success("Webhook endpoint deleted");
      onRefetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const isPending =
    setEnabledMutation.isPending ||
    sendTestMutation.isPending ||
    rotateSecretMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="rounded-full bg-violet-100 p-2">
              <Webhook className="size-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <CardTitle className="break-all text-base">
                {endpoint.url}
              </CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                {isActive ? (
                  <Badge variant="customSuccess">Active</Badge>
                ) : isAutoDisabled ? (
                  <Badge variant="customDanger">Auto-disabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
                {endpoint.consecutiveFailures > 0 && (
                  <Badge variant="customWarning">
                    {endpoint.consecutiveFailures} consecutive failed{" "}
                    {endpoint.consecutiveFailures === 1
                      ? "delivery"
                      : "deliveries"}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>

          <Switch
            checked={isActive}
            onCheckedChange={(checked) =>
              setEnabledMutation.mutate({ id: endpoint.id, enabled: checked })
            }
            disabled={isPending}
            aria-label={isActive ? "Disable endpoint" : "Enable endpoint"}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAutoDisabled && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">Delivery is paused</p>
            <p className="mt-1">
              {endpoint.disabledReason ??
                "This endpoint was disabled automatically after repeated failures."}{" "}
              Toggle the switch to re-enable it and reset the failure counter.
            </p>
          </div>
        )}

        {!isActive && !isAutoDisabled && (
          <p className="text-muted-foreground text-sm">
            This endpoint is disabled. Toggle the switch to start receiving
            deliveries again.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => sendTestMutation.mutate({ id: endpoint.id })}
            disabled={!isActive || isPending}
          >
            <Send className="mr-2 size-4" />
            Send test
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setLogOpen(true)}
          >
            <ScrollText className="mr-2 size-4" />
            Delivery log
          </Button>
          <ConfirmAction
            title="Rotate signing secret?"
            description="The current secret stops working immediately. Update every consumer with the new secret after rotating."
            confirmText="Rotate secret"
            onConfirm={() => rotateSecretMutation.mutate({ id: endpoint.id })}
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
            >
              <RefreshCw className="mr-2 size-4" />
              Rotate secret
            </Button>
          </ConfirmAction>
          <ConfirmAction
            title="Delete webhook endpoint?"
            description="This removes the endpoint and its delivery history. Consumers will stop receiving events immediately."
            confirmText="Delete endpoint"
            onConfirm={() => deleteMutation.mutate({ id: endpoint.id })}
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={isPending}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </ConfirmAction>
        </div>
      </CardContent>

      <WebhookDeliveryLogDialog
        endpointId={endpoint.id}
        endpointUrl={endpoint.url}
        open={logOpen}
        onOpenChange={setLogOpen}
      />
    </Card>
  );
}
