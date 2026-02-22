"use client";

import { api } from "@/trpc/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Skeleton,
  Switch,
  toast,
} from "@convoform/ui";
import { AlertTriangle, ExternalLink, Plus, Send } from "lucide-react";
import { useCallback, useState } from "react";
import { useChannelServerHealth } from "../../../../(mainPage)/channels/_components/useChannelServerHealth";

/**
 * Alert banner shown when the channels-server is not reachable.
 * Informs the user that all channel management actions are disabled.
 *
 * @example
 * ```tsx
 * <ChannelServerOfflineBanner />
 * ```
 */
function ChannelServerOfflineBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
      <AlertTriangle className="size-5 shrink-0" />
      <div className="text-sm">
        <p className="font-medium">Channel server is offline</p>
        <p className="text-amber-700 dark:text-amber-300">
          Bot management is disabled until the server is running.
        </p>
      </div>
    </div>
  );
}

/**
 * Dialog for creating a new bot and immediately assigning it to this form.
 *
 * @example
 * ```tsx
 * <CreateAndAssignBotDialog formId="form_abc" onSuccess={() => refetch()} disabled={false} />
 * ```
 */
function CreateAndAssignBotDialog({
  formId,
  onSuccess,
  disabled,
}: {
  formId: string;
  onSuccess: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [botToken, setBotToken] = useState("");

  const createMutation = api.channelConnection.create.useMutation({
    onSuccess: () => {
      toast.success(
        "Telegram bot created and assigned! Webhook registered automatically.",
      );
      setBotToken("");
      setOpen(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = useCallback(() => {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Plus className="size-4 mr-2" />
          Create New Bot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create & Assign Telegram Bot</DialogTitle>
          <DialogDescription>
            Enter the bot token from{" "}
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-1"
            >
              @BotFather <ExternalLink className="size-3" />
            </a>
            . The bot will be created and assigned to this form.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="newBotTokenForm">Bot Token</Label>
            <Input
              type="password"
              id="newBotTokenForm"
              placeholder="123456789:ABCdefGHI-jklMNO..."
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!botToken.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create & Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Telegram channel card showing the currently assigned bot for this form,
 * with the ability to assign an existing unassigned bot, create a new bot,
 * or unassign the current bot.
 *
 * @example
 * ```tsx
 * <TelegramChannelCard
 *   formId="form_abc"
 *   connection={{ id: "conn_1", channelIdentifier: "123456", enabled: true, channelConfig: { webhookUrl: "..." } }}
 *   availableBots={[{ id: "conn_2", channelIdentifier: "789012", formId: null }]}
 *   onRefetch={() => refetch()}
 *   disabled={false}
 * />
 * ```
 */
function TelegramChannelCard({
  formId,
  connection,
  availableBots,
  onRefetch,
  disabled: serverOffline,
}: {
  formId: string;
  connection?: {
    id: string;
    channelIdentifier: string;
    enabled: boolean;
    channelConfig: Record<string, unknown>;
  };
  availableBots: {
    id: string;
    channelIdentifier: string;
    formId: string | null;
  }[];
  onRefetch: () => void;
  disabled?: boolean;
}) {
  const updateMutation = api.channelConnection.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const assignMutation = api.channelConnection.assignForm.useMutation({
    onSuccess: () => {
      toast.success("Bot assigned to this form");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const unassignMutation = api.channelConnection.unassignForm.useMutation({
    onSuccess: () => {
      toast.success("Bot unassigned from this form");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleToggle = useCallback(
    (checked: boolean) => {
      if (!connection) return;
      updateMutation.mutate({ id: connection.id, enabled: checked });
    },
    [connection, updateMutation],
  );

  const handleUnassign = useCallback(() => {
    if (!connection) return;
    unassignMutation.mutate({ id: connection.id });
  }, [connection, unassignMutation]);

  const handleAssign = useCallback(
    (botId: string) => {
      assignMutation.mutate({ id: botId, formId });
    },
    [formId, assignMutation],
  );

  const isAssigned = !!connection;
  const isEnabled = connection?.enabled ?? false;
  const webhookUrl = (connection?.channelConfig?.webhookUrl as string) ?? "";

  // Unassigned bots that can be assigned to this form
  const unassignedBots = availableBots.filter((b) => b.formId === null);

  const isPending =
    updateMutation.isPending ||
    assignMutation.isPending ||
    unassignMutation.isPending;

  const isDisabled = isPending || !!serverOffline;

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
          {isAssigned && (
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isDisabled}
            />
          )}
        </div>
      </CardHeader>

      {/* No bot assigned — show assignment options */}
      {!isAssigned && (
        <CardContent className="space-y-4">
          {unassignedBots.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Assign an existing bot to this form:
              </p>
              <div className="space-y-2">
                {unassignedBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <Send className="size-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-mono">
                        Bot {bot.channelIdentifier}
                      </span>
                      <Badge variant="outline">Unassigned</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssign(bot.id)}
                      disabled={isDisabled}
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No unassigned bots available. Create a new bot to connect:
            </p>
          )}
          <CreateAndAssignBotDialog
            formId={formId}
            onSuccess={onRefetch}
            disabled={!!serverOffline}
          />
        </CardContent>
      )}

      {/* Bot assigned and enabled — show status */}
      {isAssigned && isEnabled && (
        <CardContent className="space-y-4">
          <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
            ✓ Bot{" "}
            <span className="font-mono">{connection.channelIdentifier}</span> is
            connected and ready to receive messages.
          </div>

          {webhookUrl && (
            <div className="grid w-full max-w-lg items-center gap-2">
              <Label>Webhook URL</Label>
              <code className="bg-muted px-3 py-2 rounded text-xs break-all">
                {webhookUrl}
              </code>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleUnassign}
            disabled={isDisabled}
          >
            Unassign from this form
          </Button>
        </CardContent>
      )}

      {/* Bot assigned but disabled */}
      {isAssigned && !isEnabled && (
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Bot{" "}
            <span className="font-mono">{connection.channelIdentifier}</span> is
            assigned but disabled. Toggle the switch above to re-enable it.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnassign}
            disabled={isDisabled}
          >
            Unassign from this form
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Channel connections settings for a specific form.
 * Shows the currently assigned bot (if any) and allows assigning/creating bots.
 *
 * When the channels-server is offline, all management actions are disabled
 * and an alert banner is shown.
 *
 * @example
 * ```tsx
 * <ChannelConnectionsSettings formId="form_abc" />
 * ```
 */
export default function ChannelConnectionsSettings({
  formId,
}: { formId: string }) {
  const { isOnline, isLoading: isHealthLoading } = useChannelServerHealth();

  const {
    data: connections,
    isLoading: isLoadingConnections,
    refetch: refetchConnections,
  } = api.channelConnection.listForForm.useQuery(
    { formId },
    { refetchOnMount: true, refetchOnWindowFocus: true },
  );

  const {
    data: availableBots,
    isLoading: isLoadingAvailable,
    refetch: refetchAvailable,
  } = api.channelConnection.listAvailableForForm.useQuery(
    { formId },
    { refetchOnMount: true, refetchOnWindowFocus: true },
  );

  const refetch = useCallback(() => {
    refetchConnections();
    refetchAvailable();
  }, [refetchConnections, refetchAvailable]);

  if (isLoadingConnections || isLoadingAvailable) {
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

  const serverOffline = !isHealthLoading && !isOnline;

  return (
    <div className="space-y-6">
      {serverOffline && <ChannelServerOfflineBanner />}
      <TelegramChannelCard
        formId={formId}
        connection={
          telegramConnection
            ? {
                id: telegramConnection.id,
                channelIdentifier: telegramConnection.channelIdentifier,
                enabled: telegramConnection.enabled,
                channelConfig: telegramConnection.channelConfig as Record<
                  string,
                  unknown
                >,
              }
            : undefined
        }
        availableBots={(availableBots ?? []).map((b) => ({
          id: b.id,
          channelIdentifier: b.channelIdentifier,
          formId: b.formId,
        }))}
        onRefetch={refetch}
        disabled={serverOffline}
      />
    </div>
  );
}
