import type { RespondentMetadata } from "@convoform/db/src/schema";

export const WEBHOOK_EVENT_TYPE = "response.completed" as const;
export const WEBHOOK_PAYLOAD_VERSION = "1" as const;
export const MAX_WEBHOOK_PAYLOAD_BYTES = 64 * 1024;

export interface WebhookPayloadField {
  fieldName: string;
  fieldValue: string;
}

export interface ResponseCompletedWebhookPayload {
  type: typeof WEBHOOK_EVENT_TYPE;
  version: typeof WEBHOOK_PAYLOAD_VERSION;
  timestamp: string;
  data: {
    responseId: string;
    formId: string;
    formName: string;
    submittedAt: string;
    fields: WebhookPayloadField[];
    metadata: {
      source: string;
    };
    /** Set when field values were truncated to fit the 64 KB limit. */
    truncated?: boolean;
  };
}

export interface ConversationForWebhookPayload {
  id: string;
  formId: string;
  formFieldResponses: Array<{
    fieldName: string;
    fieldValue: string | null;
  }>;
  metaData: RespondentMetadata | null;
  finishedAt: Date | null;
  createdAt: Date;
  channelType: string | null;
}

export interface BuildResponseCompletedPayloadOptions {
  conversation: ConversationForWebhookPayload;
  formName: string;
  timestamp?: Date;
}

export function buildResponseCompletedPayload({
  conversation,
  formName,
  timestamp = new Date(),
}: BuildResponseCompletedPayloadOptions): ResponseCompletedWebhookPayload {
  const submittedAt = resolveSubmittedAt(conversation);

  const payload: ResponseCompletedWebhookPayload = {
    type: WEBHOOK_EVENT_TYPE,
    version: WEBHOOK_PAYLOAD_VERSION,
    timestamp: timestamp.toISOString(),
    data: {
      responseId: conversation.id,
      formId: conversation.formId,
      formName,
      submittedAt: submittedAt.toISOString(),
      fields: conversation.formFieldResponses.map((field) => ({
        fieldName: field.fieldName,
        fieldValue: field.fieldValue ?? "",
      })),
      metadata: {
        source: conversation.channelType ?? "web",
      },
    },
  };

  return enforceWebhookPayloadSize(payload);
}

export function buildTestWebhookPayload({
  deliveryId,
  formId,
  timestamp = new Date(),
}: {
  deliveryId: string;
  formId: string;
  timestamp?: Date;
}): ResponseCompletedWebhookPayload {
  const iso = timestamp.toISOString();

  return {
    type: WEBHOOK_EVENT_TYPE,
    version: WEBHOOK_PAYLOAD_VERSION,
    timestamp: iso,
    data: {
      responseId: `test_${deliveryId}`,
      formId,
      formName: "Webhook test",
      submittedAt: iso,
      fields: [
        { fieldName: "Sample field", fieldValue: "Sample value" },
        {
          fieldName: "Another field",
          fieldValue: "This is a test delivery from ConvoForm",
        },
      ],
      metadata: {
        source: "test",
      },
    },
  };
}

/**
 * Keep the serialized payload under the 64 KB limit by truncating field
 * values. The delivery itself is never dropped.
 */
export function enforceWebhookPayloadSize(
  payload: ResponseCompletedWebhookPayload,
  maxBytes = MAX_WEBHOOK_PAYLOAD_BYTES,
): ResponseCompletedWebhookPayload {
  if (payloadByteLength(payload) <= maxBytes) {
    return payload;
  }

  const truncated: ResponseCompletedWebhookPayload = {
    ...payload,
    data: {
      ...payload.data,
      truncated: true,
      fields: payload.data.fields.map((field) => ({ ...field })),
    },
  };

  const fields = truncated.data.fields;
  if (!fields.length) {
    return truncated;
  }

  // Measure everything except the field values, then distribute what is left
  // across the values.
  const overhead = payloadByteLength({
    ...truncated,
    data: {
      ...truncated.data,
      fields: fields.map((field) => ({ ...field, fieldValue: "" })),
    },
  });

  if (overhead >= maxBytes) {
    truncated.data.fields = [];
    return truncated;
  }

  const valueBudget = Math.max(0, maxBytes - overhead - 64);
  let perFieldChars = Math.floor(valueBudget / fields.length);

  while (perFieldChars >= 0) {
    for (const field of fields) {
      field.fieldValue = field.fieldValue.slice(0, perFieldChars);
    }

    if (payloadByteLength(truncated) <= maxBytes) {
      return truncated;
    }

    if (perFieldChars === 0) {
      break;
    }

    perFieldChars = Math.floor(perFieldChars * 0.75) - 1;
  }

  // Even field names/metadata can exceed the limit in pathological cases.
  truncated.data.fields = [];
  return truncated;
}

export function payloadByteLength(
  payload: ResponseCompletedWebhookPayload,
): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

function resolveSubmittedAt(conversation: ConversationForWebhookPayload) {
  const submittedAt = conversation.metaData?.submittedAt;
  if (submittedAt) {
    const parsed = new Date(submittedAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return conversation.finishedAt ?? conversation.createdAt ?? new Date();
}
