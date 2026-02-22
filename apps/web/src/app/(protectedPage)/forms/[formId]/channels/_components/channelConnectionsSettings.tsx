"use client";

import { api } from "@/trpc/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Switch,
  toast,
} from "@convoform/ui";
import { Copy, ExternalLink, MessageSquare, Send } from "lucide-react";
import { useCallback, useState } from "react";

/**
 * Telegram channel card with bot token configuration and enable/disable toggle.
 * Webhook is auto-registered on connect — no manual URL input needed.
 *
 * @example
 * ```tsx
 * <TelegramChannelCard
 *   formId="form_abc"
 *   connection={{ id: "conn_1", enabled: true, channelConfig: { webhookUrl: "..." } }}
 *   onRefetch={() => refetch()}
 * />
 * ```
 */
function TelegramChannelCard({
  formId,
  connection,
  onRefetch,
}: {
  formId: string;
  connection?: {
    id: string;
    enabled: boolean;
    channelConfig: Record<string, unknown>;
  };
  onRefetch: () => void;
}) {
  const [botToken, setBotToken] = useState("");

  const createMutation = api.channelConnection.create.useMutation({
    onSuccess: () => {
      toast.success(
        "Telegram channel connected! Webhook registered automatically.",
      );
      setBotToken("");
      onRefetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const updateMutation = api.channelConnection.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      onRefetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = api.channelConnection.delete.useMutation({
    onSuccess: () => {
      toast.success("Telegram channel disconnected");
      onRefetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleConnect = useCallback(() => {
    if (!botToken.trim()) {
      toast.error("Please enter a bot token");
      return;
    }
    createMutation.mutate({
      formId,
      channelType: "telegram",
      channelConfig: { botToken: botToken.trim() },
    });
  }, [botToken, formId, createMutation]);

  const handleToggle = useCallback(
    (checked: boolean) => {
      if (!connection) return;
      updateMutation.mutate({
        id: connection.id,
        enabled: checked,
      });
    },
    [connection, updateMutation],
  );

  const handleDisconnect = useCallback(() => {
    if (!connection) return;
    deleteMutation.mutate({ id: connection.id });
  }, [connection, deleteMutation]);

  const isConnected = !!connection;
  const isEnabled = connection?.enabled ?? false;
  const webhookUrl = (connection?.channelConfig?.webhookUrl as string) ?? "";

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Telegram</CardTitle>
              <CardDescription>
                Receive form responses via a Telegram bot
              </CardDescription>
            </div>
          </div>
          {isConnected && (
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isPending}
            />
          )}
        </div>
      </CardHeader>

      {/* Not connected yet — show setup form */}
      {!isConnected && (
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="botToken">Bot Token</Label>
            <Input
              type="password"
              id="botToken"
              placeholder="Enter your Telegram bot token"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Get a bot token from{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                @BotFather <ExternalLink className="size-3" />
              </a>
            </p>
          </div>
          <Button
            onClick={handleConnect}
            disabled={!botToken.trim() || isPending}
            size="sm"
          >
            {createMutation.isPending ? (
              "Connecting..."
            ) : (
              <>
                <MessageSquare className="size-4 mr-2" />
                Connect Telegram Bot
              </>
            )}
          </Button>
        </CardContent>
      )}

      {/* Connected and enabled — show status */}
      {isConnected && isEnabled && (
        <CardContent className="space-y-4">
          <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
            ✓ Bot connected and webhook registered. Your Telegram bot is ready
            to receive messages.
          </div>

          {webhookUrl && (
            <div className="grid w-full max-w-lg items-center gap-2">
              <Label>Webhook URL</Label>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded text-xs break-all flex-1">
                  {webhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    toast.info("Webhook URL copied");
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            disabled={isPending}
          >
            Disconnect
          </Button>
        </CardContent>
      )}

      {/* Connected but disabled */}
      {isConnected && !isEnabled && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Telegram channel is disabled. Toggle the switch above to re-enable
            it.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            disabled={isPending}
            className="mt-3"
          >
            Disconnect
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export default function ChannelConnectionsSettings({
  formId,
}: { formId: string }) {
  const {
    data: connections,
    isLoading,
    refetch,
  } = api.channelConnection.listForForm.useQuery(
    { formId },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const telegramConnection = connections?.find(
    (c) => c.channelType === "telegram",
  );

  return (
    <div className="space-y-6">
      <TelegramChannelCard
        formId={formId}
        connection={
          telegramConnection
            ? {
                id: telegramConnection.id,
                enabled: telegramConnection.enabled,
                channelConfig: telegramConnection.channelConfig as Record<
                  string,
                  unknown
                >,
              }
            : undefined
        }
        onRefetch={() => refetch()}
      />
    </div>
  );
}
