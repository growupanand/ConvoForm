import { isConversationInProgress } from "@/lib/conversationStatus";
import type { Conversation } from "@convoform/db/src/schema";

/** One initial Cloudflare Workflow attempt plus seven retries. */
export const MAX_WEBHOOK_ATTEMPTS = 8;

export type JourneyStatus = "finished" | "inProgress" | "abandoned";

export type JourneyNodeId =
  | "started"
  | "fields"
  | "outcome"
  | "insights"
  | "webhook";

export type JourneyNodeState =
  | "complete"
  | "current"
  | "pending"
  | "skipped"
  | "warning"
  | "error";

export type JourneyWebhookDeliveryStatus =
  | "pending"
  | "delivering"
  | "success"
  | "failed";

export type JourneyWebhookDelivery = {
  id: string;
  endpointId: string;
  endpointUrl: string;
  status: JourneyWebhookDeliveryStatus;
  attempts: number;
  lastStatusCode: number | null;
  lastLatencyMs: number | null;
  lastError: string | null;
  deliveredAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type JourneyWebhookEndpoint = {
  id: string;
  url: string;
  enabled: boolean;
  disabledAt: Date | string | null;
  createdAt: Date | string;
};

export type JourneyWebhookSummary =
  | "delivered"
  | "retrying"
  | "sending"
  | "pending"
  | "failed"
  | "notQueued";

export type JourneyWebhookDetail = {
  summary: JourneyWebhookSummary;
  deliveries: JourneyWebhookDelivery[];
  endpoints: JourneyWebhookEndpoint[];
};

export type JourneyNode = {
  id: JourneyNodeId;
  title: string;
  subtitle?: string;
  timestamp?: Date | null;
  state: JourneyNodeState;
  webhook?: JourneyWebhookDetail;
};

export type ConversationJourneyInput = {
  conversation: Pick<
    Conversation,
    | "createdAt"
    | "updatedAt"
    | "finishedAt"
    | "isInProgress"
    | "currentFieldId"
    | "channelType"
    | "formFieldResponses"
    | "metaData"
  >;
  webhookEndpoints?: JourneyWebhookEndpoint[];
  webhookDeliveries?: JourneyWebhookDelivery[];
};

export type ConversationJourneyData = {
  endpoints: JourneyWebhookEndpoint[];
  deliveries: JourneyWebhookDelivery[];
};

export type ConversationJourney = {
  status: JourneyStatus;
  nodes: JourneyNode[];
  fieldsAnswered: number;
  fieldsTotal: number;
  abandonedAtField?: string;
};

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function getConversationStatus(
  conversation: ConversationJourneyInput["conversation"],
): JourneyStatus {
  if (conversation.finishedAt) {
    return "finished";
  }

  return isConversationInProgress(conversation) ? "inProgress" : "abandoned";
}

/**
 * `currentFieldId` points at the field the respondent was answering. When it
 * is missing (older conversations, channel handoffs), fall back to the first
 * unanswered field so the label still names where they stopped.
 */
export function resolveAbandonedField(
  conversation: Pick<
    ConversationJourneyInput["conversation"],
    "currentFieldId" | "formFieldResponses"
  >,
): string | undefined {
  if (conversation.currentFieldId) {
    const currentField = conversation.formFieldResponses.find(
      (field) => field.id === conversation.currentFieldId,
    );

    if (currentField?.fieldName) {
      return currentField.fieldName;
    }
  }

  return conversation.formFieldResponses.find(
    (field) => field.fieldValue == null,
  )?.fieldName;
}

function getStartedSubtitle(
  conversation: ConversationJourneyInput["conversation"],
) {
  const channel = (conversation.channelType || "Web").toLowerCase();
  const channelLabel = channel.charAt(0).toUpperCase() + channel.slice(1);
  const browser = conversation.metaData?.userAgent?.browser?.name;

  return browser ? `${channelLabel} · ${browser}` : channelLabel;
}

export function getWebhookAttemptNumber(
  status: JourneyWebhookDeliveryStatus,
  attempts: number,
) {
  const attempt = status === "delivering" ? attempts + 1 : attempts;

  return Math.max(1, Math.min(attempt, MAX_WEBHOOK_ATTEMPTS));
}

export function formatWebhookAttempt(
  status: JourneyWebhookDeliveryStatus,
  attempts: number,
) {
  return `Attempt ${getWebhookAttemptNumber(status, attempts)} of ${MAX_WEBHOOK_ATTEMPTS}`;
}

export function getWebhookDeliveryLabel(
  status: JourneyWebhookDeliveryStatus,
  attempts = 0,
) {
  switch (status) {
    case "success":
      return "Delivered";
    case "failed":
      return "Failed";
    case "delivering":
      return attempts === 0 ? "Sending" : "Retrying";
    case "pending":
      return "Pending";
  }
}

export function truncateWebhookUrl(url: string, maxLength = 48) {
  const withoutProtocol = url.replace(/^https?:\/\//, "");

  return withoutProtocol.length > maxLength
    ? `${withoutProtocol.slice(0, maxLength - 1)}…`
    : withoutProtocol;
}

function buildWebhookNode({
  status,
  conversation,
  endpoints,
  deliveries,
}: {
  status: JourneyStatus;
  conversation: ConversationJourneyInput["conversation"];
  endpoints: JourneyWebhookEndpoint[];
  deliveries: JourneyWebhookDelivery[];
}): JourneyNode | null {
  // No endpoint was configured and nothing was queued: the node would only
  // repeat that absence, so keep the strip shorter.
  if (endpoints.length === 0 && deliveries.length === 0) {
    return null;
  }

  const baseNode = {
    id: "webhook" as const,
    title: "Webhook",
  };

  if (conversation.metaData?.isOwnerPreview === true) {
    return {
      ...baseNode,
      subtitle: "Owner preview · webhooks skipped",
      state: "skipped",
    };
  }

  if (status === "inProgress") {
    return {
      ...baseNode,
      subtitle: "Pending",
      state: "pending",
    };
  }

  if (status === "abandoned") {
    return {
      ...baseNode,
      subtitle: "Not sent",
      state: "skipped",
    };
  }

  if (deliveries.length === 0) {
    const finishedAt = toDate(conversation.finishedAt);
    const applicableEndpoints = finishedAt
      ? endpoints.filter((endpoint) => {
          const createdAt = toDate(endpoint.createdAt);

          return (
            endpoint.enabled && createdAt != null && createdAt <= finishedAt
          );
        })
      : [];

    // No endpoint existed (and was enabled) when the response completed, so
    // there was nothing to deliver. Avoid a false "Not queued" warning for
    // endpoints added after the fact or disabled endpoints.
    if (applicableEndpoints.length === 0) {
      return null;
    }

    return {
      ...baseNode,
      subtitle: "Not queued",
      state: "warning",
      webhook: {
        summary: "notQueued",
        deliveries,
        endpoints: applicableEndpoints,
      },
    };
  }

  const failed = deliveries.filter((delivery) => delivery.status === "failed");
  const retrying = deliveries.filter(
    (delivery) => delivery.status === "delivering",
  );
  const pending = deliveries.filter(
    (delivery) => delivery.status === "pending",
  );
  const delivered = deliveries.filter(
    (delivery) => delivery.status === "success",
  );
  const endpointCount = deliveries.length;

  let summary: JourneyWebhookSummary;
  let label: string;
  let state: JourneyNodeState;
  let timestamp: Date | null = null;

  if (failed.length > 0) {
    summary = "failed";
    label =
      endpointCount > 1
        ? `Failed · ${failed.length} of ${endpointCount} endpoints`
        : "Failed";
    state = "error";
    timestamp = toDate(
      failed
        .map((delivery) => toDate(delivery.updatedAt))
        .filter((date): date is Date => date != null)
        .sort((a, b) => b.getTime() - a.getTime())[0],
    );
  } else if (retrying.length > 0) {
    const maxAttempts = Math.max(
      ...retrying.map((delivery) => delivery.attempts),
    );
    const nextAttempt = getWebhookAttemptNumber("delivering", maxAttempts);
    const isSending = maxAttempts === 0;

    summary = isSending ? "sending" : "retrying";
    label = `${isSending ? "Sending" : "Retrying"} · attempt ${nextAttempt} of ${MAX_WEBHOOK_ATTEMPTS}`;
    state = "current";
  } else if (pending.length > 0) {
    summary = "pending";
    label = "Pending";
    state = "pending";
  } else {
    summary = "delivered";
    label =
      endpointCount > 1
        ? `Delivered · ${endpointCount} endpoints`
        : "Delivered";
    state = "complete";
    timestamp = toDate(
      delivered
        .map((delivery) => toDate(delivery.deliveredAt))
        .filter((date): date is Date => date != null)
        .sort((a, b) => b.getTime() - a.getTime())[0],
    );
  }

  return {
    ...baseNode,
    subtitle: label,
    state,
    timestamp,
    webhook: {
      summary,
      deliveries,
      endpoints,
    },
  };
}

/**
 * Map a conversation plus its webhook rows into the journey strip nodes.
 *
 * This stays pure so every state (finished, abandoned, in progress, owner
 * preview, retrying, missing insights) is covered by unit tests without
 * rendering the page.
 */
export function buildConversationJourney({
  conversation,
  webhookEndpoints = [],
  webhookDeliveries = [],
}: ConversationJourneyInput): ConversationJourney {
  const status = getConversationStatus(conversation);
  const fieldsTotal = conversation.formFieldResponses.length;
  const fieldsAnswered = conversation.formFieldResponses.filter(
    (field) => field.fieldValue != null,
  ).length;
  const abandonedAtField =
    status === "abandoned" ? resolveAbandonedField(conversation) : undefined;

  const startedNode: JourneyNode = {
    id: "started",
    title: "Started",
    subtitle: getStartedSubtitle(conversation),
    timestamp: toDate(conversation.createdAt),
    state: "complete",
  };

  const fieldsNode: JourneyNode = {
    id: "fields",
    title: "Fields answered",
    subtitle: `${fieldsAnswered} of ${fieldsTotal}`,
    state:
      fieldsTotal > 0 && fieldsAnswered === fieldsTotal
        ? "complete"
        : status === "inProgress"
          ? "current"
          : fieldsAnswered > 0
            ? "complete"
            : "skipped",
  };

  const outcomeNode: JourneyNode =
    status === "finished"
      ? {
          id: "outcome",
          title: "Finished",
          timestamp: toDate(conversation.finishedAt),
          state: "complete",
        }
      : status === "inProgress"
        ? {
            id: "outcome",
            title: "In progress",
            subtitle: resolveAbandonedField(conversation)
              ? `Waiting on ${resolveAbandonedField(conversation)}`
              : undefined,
            state: "current",
          }
        : {
            id: "outcome",
            title: abandonedAtField
              ? `Abandoned at ${abandonedAtField}`
              : "Abandoned",
            state: "warning",
          };

  const insights = conversation.metaData?.insights;
  const insightsNode: JourneyNode = insights?.generatedAt
    ? {
        id: "insights",
        title: "Insights generated",
        subtitle: insights.isPartial ? "Partial analysis" : undefined,
        timestamp: toDate(insights.generatedAt),
        state: "complete",
      }
    : {
        id: "insights",
        title: "Insights generated",
        subtitle:
          status === "abandoned"
            ? "Skipped"
            : status === "inProgress"
              ? "Pending"
              : "Not generated",
        state: status === "inProgress" ? "pending" : "skipped",
      };

  const webhookNode = buildWebhookNode({
    status,
    conversation,
    endpoints: webhookEndpoints,
    deliveries: webhookDeliveries,
  });

  return {
    status,
    nodes: [
      startedNode,
      fieldsNode,
      outcomeNode,
      insightsNode,
      ...(webhookNode ? [webhookNode] : []),
    ],
    fieldsAnswered,
    fieldsTotal,
    ...(abandonedAtField ? { abandonedAtField } : {}),
  };
}
