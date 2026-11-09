"use client";

import { cn } from "@/lib/utils";
import type { Conversation } from "@convoform/db/src/schema";
import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SectionHeading,
  Skeleton,
} from "@convoform/ui";
import {
  Check,
  ChevronDown,
  ListChecks,
  Play,
  Sparkles,
  Timer,
  Webhook,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  type ConversationJourneyData,
  type JourneyNode,
  type JourneyNodeState,
  type JourneyWebhookDelivery,
  type JourneyWebhookDeliveryStatus,
  type JourneyWebhookDetail,
  buildConversationJourney,
  formatWebhookAttempt,
  getWebhookDeliveryLabel,
  truncateWebhookUrl,
} from "./conversationJourney.utils";

type Props = {
  conversation: Conversation;
  journeyData?: ConversationJourneyData;
};

const ICON_STATE_CLASSES: Record<JourneyNodeState, string> = {
  complete: "border-primary bg-primary text-primary-foreground",
  current: "border-primary/30 bg-primary/5 text-primary",
  pending: "border-border bg-card text-subtle-foreground",
  skipped: "border-dashed border-border bg-card text-subtle-foreground",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
};

const TITLE_STATE_CLASSES: Record<JourneyNodeState, string> = {
  complete: "text-foreground",
  current: "text-foreground",
  pending: "text-foreground/75",
  skipped: "text-foreground/75",
  warning: "text-amber-700 dark:text-amber-400",
  error: "text-red-700 dark:text-red-400",
};

const DELIVERY_BADGE_VARIANTS: Record<
  JourneyWebhookDeliveryStatus,
  "customSuccess" | "customDanger" | "customInfo" | "secondary"
> = {
  success: "customSuccess",
  failed: "customDanger",
  delivering: "customInfo",
  pending: "secondary",
};

function formatJourneyTime(date: Date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNodeIcon(
  node: JourneyNode,
  status: "finished" | "inProgress" | "abandoned",
) {
  switch (node.id) {
    case "started":
      return Play;
    case "fields":
      return ListChecks;
    case "outcome":
      return status === "finished" ? Check : status === "abandoned" ? X : Timer;
    case "insights":
      return Sparkles;
    case "webhook":
      return Webhook;
  }
}

function JourneyNodeItem({
  node,
  status,
  isLast,
  settingsHref,
}: {
  node: JourneyNode;
  status: "finished" | "inProgress" | "abandoned";
  isLast: boolean;
  settingsHref: string;
}) {
  const Icon = getNodeIcon(node, status);
  const hasPopover = node.webhook != null;

  const nodeContent = (
    <>
      <span
        className={cn(
          "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border",
          ICON_STATE_CLASSES[node.state],
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 lg:mt-2 lg:block">
        <span
          className={cn(
            "block text-sm font-medium leading-5",
            TITLE_STATE_CLASSES[node.state],
          )}
        >
          {node.title}
        </span>
        {node.subtitle && (
          <span className="mt-0.5 flex items-center gap-1 text-xs leading-4 text-subtle-foreground">
            <span className="min-w-0">{node.subtitle}</span>
            {hasPopover && (
              <ChevronDown className="size-3 shrink-0 transition-transform duration-150 group-hover:text-foreground group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
            )}
          </span>
        )}
        {node.timestamp && (
          <span className="mt-0.5 block text-[11px] leading-4 tabular-nums text-subtle-foreground">
            {formatJourneyTime(node.timestamp)}
          </span>
        )}
      </span>
    </>
  );

  return (
    <li
      data-journey-node={node.id}
      className="relative flex min-w-0 gap-3 pb-5 last:pb-0 lg:block lg:flex-1 lg:pb-0 lg:pr-5 lg:last:pr-0"
    >
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-3.5 top-7 h-full w-px bg-border lg:left-7 lg:right-0 lg:top-3.5 lg:h-px lg:w-auto"
        />
      )}
      {node.webhook ? (
        <Popover>
          <PopoverTrigger className="group flex w-full items-start gap-3 rounded-md text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:block">
            {nodeContent}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[22rem] max-w-[calc(100vw-2rem)] p-0"
          >
            <WebhookJourneyPopover
              webhook={node.webhook}
              settingsHref={settingsHref}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <div className="flex w-full items-start gap-3 lg:block">
          {nodeContent}
        </div>
      )}
    </li>
  );
}

function WebhookJourneyPopover({
  webhook,
  settingsHref,
}: {
  webhook: JourneyWebhookDetail;
  settingsHref: string;
}) {
  return (
    <div className="text-sm">
      <div className="border-b px-4 py-3">
        <p className="font-medium leading-5">Webhook deliveries</p>
        <p className="text-subtle-foreground text-xs">response.completed</p>
      </div>
      <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
        {webhook.deliveries.length > 0 ? (
          webhook.deliveries.map((delivery) => (
            <WebhookDeliveryRow key={delivery.id} delivery={delivery} />
          ))
        ) : webhook.endpoints.length > 0 ? (
          webhook.endpoints.map((endpoint) => (
            <div key={endpoint.id} className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span
                  className="truncate font-mono text-[11px] leading-4 text-foreground"
                  title={endpoint.url}
                >
                  {truncateWebhookUrl(endpoint.url)}
                </span>
                <Badge variant="secondary" className="shrink-0">
                  Not queued
                </Badge>
              </div>
              <p className="text-[11px] leading-4 text-subtle-foreground">
                No delivery was created for this response.
              </p>
            </div>
          ))
        ) : (
          <p className="text-subtle-foreground text-xs">
            No delivery record for this response.
          </p>
        )}
      </div>
      <div className="border-t px-4 py-2.5">
        <Link
          href={settingsHref}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          View delivery log →
        </Link>
      </div>
    </div>
  );
}

function WebhookDeliveryRow({
  delivery,
}: {
  delivery: JourneyWebhookDelivery;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-start justify-between gap-2">
        <span
          className="truncate font-mono text-[11px] leading-4 text-foreground"
          title={delivery.endpointUrl}
        >
          {truncateWebhookUrl(delivery.endpointUrl)}
        </span>
        <Badge
          variant={DELIVERY_BADGE_VARIANTS[delivery.status]}
          className="shrink-0"
        >
          {getWebhookDeliveryLabel(delivery.status)}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-4 tabular-nums text-subtle-foreground">
        <span>HTTP {delivery.lastStatusCode ?? "—"}</span>
        <span>{formatWebhookAttempt(delivery.attempts)}</span>
        <span>
          {delivery.lastLatencyMs != null
            ? `${delivery.lastLatencyMs} ms`
            : "—"}
        </span>
      </div>
      {delivery.lastError && (
        <p className="line-clamp-2 text-[11px] leading-4 text-red-600 dark:text-red-400">
          {delivery.lastError}
        </p>
      )}
    </div>
  );
}

export function ConversationJourney({ conversation, journeyData }: Props) {
  const journey = useMemo(
    () =>
      buildConversationJourney({
        conversation,
        webhookEndpoints: journeyData?.endpoints,
        webhookDeliveries: journeyData?.deliveries,
      }),
    [conversation, journeyData],
  );

  const settingsHref = `/forms/${conversation.formId}/settings/webhooks`;

  return (
    <section aria-label="Conversation journey" className="px-2 pb-6">
      <SectionHeading
        className="mb-2"
        titleClassName="text-xs font-medium uppercase tracking-wider text-subtle-foreground"
      >
        Journey
      </SectionHeading>
      <ol className="flex flex-col lg:flex-row lg:items-start">
        {journey.nodes.map((node, index) => (
          <JourneyNodeItem
            key={node.id}
            node={node}
            status={journey.status}
            isLast={index === journey.nodes.length - 1}
            settingsHref={settingsHref}
          />
        ))}
      </ol>
    </section>
  );
}

export function ConversationJourneySkeleton() {
  return (
    <div className="px-2 pb-6">
      <Skeleton className="mb-2 h-3 w-16" />
      <div className="flex flex-col lg:flex-row lg:items-start">
        {["started", "fields", "outcome", "insights", "webhook"].map((key) => (
          <div
            key={key}
            className="flex gap-3 pb-5 last:pb-0 lg:block lg:flex-1 lg:pb-0 lg:pr-5 lg:last:pr-0"
          >
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <div className="min-w-0 space-y-1.5 lg:mt-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
