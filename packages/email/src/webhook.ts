import { Resend, type WebhookEventPayload } from "resend";
import { env } from "./env";

export class ResendWebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResendWebhookVerificationError";
  }
}

export type ResendWebhookHeaders = {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
};

/**
 * Verifies a Resend webhook payload using its Svix signature headers.
 *
 * Throws when the signing secret is missing or the signature is invalid.
 */
export function verifyResendWebhookEvent({
  payload,
  headers,
  secret = env.RESEND_WEBHOOK_SECRET,
}: {
  payload: string;
  headers: ResendWebhookHeaders;
  secret?: string;
}): WebhookEventPayload {
  if (!secret) {
    throw new ResendWebhookVerificationError(
      "RESEND_WEBHOOK_SECRET is not set",
    );
  }

  if (!headers.id || !headers.timestamp || !headers.signature) {
    throw new ResendWebhookVerificationError(
      "Missing Resend webhook signature headers",
    );
  }

  const resend = new Resend(env.RESEND_API_KEY || "re_123");

  return resend.webhooks.verify({
    payload,
    headers: {
      id: headers.id,
      timestamp: headers.timestamp,
      signature: headers.signature,
    },
    webhookSecret: secret,
  });
}

export type ResendWebhookAnalyticsEvent = {
  eventName: "email:bounced" | "email:failed";
  distinctId: string;
  properties: {
    emailId: string;
    eventType: "email.bounced" | "email.failed";
    bounceType?: string;
    bounceSubType?: string;
  };
};

/**
 * Maps a verified Resend webhook event to a sanitized analytics event.
 *
 * Only non-PII identifiers and categorical bounce details are kept. Recipient
 * addresses, sender addresses, subjects and failure messages are dropped.
 */
export function toResendWebhookAnalyticsEvent(
  event: WebhookEventPayload,
): ResendWebhookAnalyticsEvent | null {
  switch (event.type) {
    case "email.bounced":
      return {
        eventName: "email:bounced",
        distinctId: event.data.email_id,
        properties: {
          emailId: event.data.email_id,
          eventType: event.type,
          bounceType: event.data.bounce.type,
          bounceSubType: event.data.bounce.subType,
        },
      };

    case "email.failed":
      return {
        eventName: "email:failed",
        distinctId: event.data.email_id,
        properties: {
          emailId: event.data.email_id,
          eventType: event.type,
        },
      };

    default:
      return null;
  }
}
