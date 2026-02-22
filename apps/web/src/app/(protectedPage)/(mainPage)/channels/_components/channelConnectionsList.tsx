"use client";

import { api } from "@/trpc/react";
import {
  Badge,
  Button,
  Card,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  toast,
} from "@convoform/ui";
import { ExternalLink, MessageSquare, Plus, Send, Unplug } from "lucide-react";
import { useCallback, useState } from "react";

/** Channel type display metadata (icon, label, color). */
const CHANNEL_META: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  telegram: {
    icon: <Send className="size-4" />,
    label: "Telegram",
    color: "bg-blue-100 text-blue-600",
  },
};

const UNASSIGNED_FORM_VALUE = "__unassigned__";

/**
 * Dialog for creating a new Telegram bot (without requiring a form).
 *
 * @example
 * ```tsx
 * <AddBotDialog onSuccess={() => refetch()} />
 * ```
 */
function AddBotDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [botToken, setBotToken] = useState("");

  const createMutation = api.channelConnection.create.useMutation({
    onSuccess: () => {
      toast.success("Telegram bot added! Webhook registered automatically.");
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
      channelType: "telegram",
      channelConfig: { botToken: botToken.trim() },
    });
  }, [botToken, createMutation]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4 mr-2" />
          Add Telegram Bot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Telegram Bot</DialogTitle>
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
            . You can assign it to a form later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="newBotToken">Bot Token</Label>
            <Input
              type="password"
              id="newBotToken"
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
            {createMutation.isPending ? "Adding..." : "Add Bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Renders a single bot row with form assignment dropdown, toggle, and delete.
 *
 * @example
 * ```tsx
 * <BotRow
 *   connection={{ id: "conn_1", channelType: "telegram", channelIdentifier: "123456", enabled: true, formId: "f1" }}
 *   forms={[{ id: "f1", name: "My Form" }, { id: "f2", name: "Survey" }]}
 *   formName="My Form"
 *   onRefetch={() => refetch()}
 * />
 * ```
 */
function BotRow({
  connection,
  forms,
  onRefetch,
}: {
  connection: {
    id: string;
    channelType: string;
    channelIdentifier: string;
    enabled: boolean;
    formId: string | null;
  };
  forms: { id: string; name: string }[];
  formName: string | null;
  onRefetch: () => void;
}) {
  const meta = CHANNEL_META[connection.channelType] ?? {
    icon: <MessageSquare className="size-4" />,
    label: connection.channelType,
    color: "bg-gray-100 text-gray-600",
  };

  const updateMutation = api.channelConnection.update.useMutation({
    onSuccess: () => {
      toast.success("Connection updated");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const assignMutation = api.channelConnection.assignForm.useMutation({
    onSuccess: () => {
      toast.success("Form assignment updated");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const unassignMutation = api.channelConnection.unassignForm.useMutation({
    onSuccess: () => {
      toast.success("Bot unassigned from form");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = api.channelConnection.delete.useMutation({
    onSuccess: () => {
      toast.success("Bot removed");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const isPending =
    updateMutation.isPending ||
    assignMutation.isPending ||
    unassignMutation.isPending ||
    deleteMutation.isPending;

  const handleToggle = useCallback(
    (checked: boolean) => {
      updateMutation.mutate({ id: connection.id, enabled: checked });
    },
    [connection.id, updateMutation],
  );

  const handleFormChange = useCallback(
    (value: string) => {
      if (value === UNASSIGNED_FORM_VALUE) {
        unassignMutation.mutate({ id: connection.id });
      } else {
        assignMutation.mutate({ id: connection.id, formId: value });
      }
    },
    [connection.id, assignMutation, unassignMutation],
  );

  const handleDelete = useCallback(() => {
    deleteMutation.mutate({ id: connection.id });
  }, [connection.id, deleteMutation]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30">
      {/* Left: channel icon + bot info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className={`p-2 rounded-full shrink-0 ${meta.color}`}>
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm">{meta.label}</p>
          <p className="text-xs text-muted-foreground font-mono">
            Bot ID: {connection.channelIdentifier}
          </p>
        </div>
      </div>

      {/* Center: form assignment */}
      <div className="flex items-center gap-3 shrink-0">
        <Select
          value={connection.formId ?? UNASSIGNED_FORM_VALUE}
          onValueChange={handleFormChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Select a form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_FORM_VALUE}>
              <span className="text-muted-foreground">Unassigned</span>
            </SelectItem>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: status + actions */}
      <div className="flex items-center gap-3 shrink-0">
        <Badge
          variant={
            !connection.enabled
              ? "secondary"
              : connection.formId
                ? "customSuccess"
                : "outline"
          }
        >
          {!connection.enabled
            ? "Disabled"
            : connection.formId
              ? "Active"
              : "Unassigned"}
        </Badge>
        <Switch
          checked={connection.enabled}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          title="Delete bot"
        >
          <Unplug className="size-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Displays all channel connections (bots) for the current organization.
 * Each bot shows its form assignment dropdown and can be managed independently.
 * Uses `useSuspenseQuery` so a parent `<Suspense>` provides the loading state.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<ChannelConnectionsListLoading />}>
 *   <ChannelConnectionsList />
 * </Suspense>
 * ```
 */
export function ChannelConnectionsList() {
  const [connections, { refetch: refetchConnections }] =
    api.channelConnection.listForOrg.useSuspenseQuery(undefined, {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });

  const [forms] = api.channelConnection.listOrgForms.useSuspenseQuery(
    undefined,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );

  const refetch = useCallback(() => {
    refetchConnections();
  }, [refetchConnections]);

  if (connections.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <AddBotDialog onSuccess={refetch} />
        </div>
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="p-3 bg-muted rounded-full mb-2">
              <MessageSquare className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">No bots added</CardTitle>
            <CardDescription className="max-w-sm">
              Add a Telegram bot to start receiving form responses. You can
              assign it to a form after adding.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {connections.length} bot{connections.length !== 1 && "s"} in your
          organization.
        </p>
        <AddBotDialog onSuccess={refetch} />
      </div>
      <div className="space-y-2">
        {connections.map((conn) => (
          <BotRow
            key={conn.id}
            connection={{
              id: conn.id,
              channelType: conn.channelType,
              channelIdentifier: conn.channelIdentifier,
              enabled: conn.enabled,
              formId: conn.formId,
            }}
            forms={forms}
            formName={conn.form?.name ?? null}
            onRefetch={refetch}
          />
        ))}
      </div>
    </div>
  );
}
