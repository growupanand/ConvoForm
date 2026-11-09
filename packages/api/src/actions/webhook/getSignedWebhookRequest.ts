import {
  assertSafeWebhookUrl,
  createWebhookSignatureHeaders,
  decrypt,
} from "@convoform/common";
import { eq } from "@convoform/db";
import {
  conversation as dbConversation,
  webhookDelivery as dbDelivery,
  form as dbForm,
} from "@convoform/db/src/schema";
import { env } from "../../env";
import type { ActionContext } from "../../types/actionContextType";
import {
  buildResponseCompletedPayload,
  buildTestWebhookPayload,
} from "./buildWebhookPayload";

export class WebhookDeliveryNotFoundError extends Error {
  constructor(deliveryId: string) {
    super(`Webhook delivery not found: ${deliveryId}`);
    this.name = "WebhookDeliveryNotFoundError";
  }
}

export class WebhookEndpointDisabledError extends Error {
  constructor(endpointId: string) {
    super(`Webhook endpoint is disabled: ${endpointId}`);
    this.name = "WebhookEndpointDisabledError";
  }
}

export class WebhookConversationNotFoundError extends Error {
  constructor(conversationId: string) {
    super(`Conversation not found for webhook delivery: ${conversationId}`);
    this.name = "WebhookConversationNotFoundError";
  }
}

export interface SignedWebhookRequest {
  deliveryId: string;
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
}

/**
 * Load a delivery, rebuild its payload from stored data, decrypt the endpoint
 * secret and return a ready-to-send signed request.
 *
 * Both the self-host adapter and the Cloudflare worker load path use this so
 * there is only one place that signs and one place that reads the DB.
 */
export async function getSignedWebhookRequest(
  deliveryId: string,
  ctx: ActionContext,
): Promise<SignedWebhookRequest> {
  const delivery = await ctx.db.query.webhookDelivery.findFirst({
    where: eq(dbDelivery.id, deliveryId),
    with: {
      endpoint: true,
    },
  });

  if (!delivery) {
    throw new WebhookDeliveryNotFoundError(deliveryId);
  }

  const endpoint = delivery.endpoint;
  if (!endpoint) {
    throw new WebhookDeliveryNotFoundError(deliveryId);
  }

  if (!endpoint.enabled || endpoint.disabledAt) {
    throw new WebhookEndpointDisabledError(endpoint.id);
  }

  const payload = delivery.isTest
    ? buildTestWebhookPayload({
        deliveryId: delivery.id,
        formId: endpoint.formId,
      })
    : await buildPayloadForDelivery(delivery.id, delivery.conversationId, ctx);

  // Re-check the URL before every send, after DNS resolution. Redirects are
  // disabled by the delivery adapter.
  const safeUrl = await assertSafeWebhookUrl(endpoint.url);

  const secret = await decrypt(endpoint.encryptedSecret, env.ENCRYPTION_KEY);
  const body = JSON.stringify(payload);
  const signatureHeaders = await createWebhookSignatureHeaders({
    deliveryId: delivery.id,
    secret,
    payload: body,
  });

  return {
    deliveryId: delivery.id,
    url: safeUrl.toString(),
    method: "POST",
    headers: {
      ...signatureHeaders,
      "content-type": "application/json",
      "user-agent": "ConvoForm-Webhooks/1.0",
    },
    body,
  };
}

async function buildPayloadForDelivery(
  deliveryId: string,
  conversationId: string | null,
  ctx: ActionContext,
) {
  if (!conversationId) {
    throw new WebhookConversationNotFoundError(`delivery:${deliveryId}`);
  }

  const conversation = await ctx.db.query.conversation.findFirst({
    where: eq(dbConversation.id, conversationId),
  });

  if (!conversation) {
    throw new WebhookConversationNotFoundError(conversationId);
  }

  const form = await ctx.db.query.form.findFirst({
    where: eq(dbForm.id, conversation.formId),
    columns: {
      name: true,
    },
  });

  return buildResponseCompletedPayload({
    conversation,
    formName: form?.name ?? "ConvoForm",
  });
}
