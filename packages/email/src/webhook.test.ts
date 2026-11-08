import { describe, expect, it } from "bun:test";
import { createHmac } from "node:crypto";

process.env.RESEND_API_KEY = "test_key";
process.env.EMAIL_FROM = "test@example.com";

const { toResendWebhookAnalyticsEvent, verifyResendWebhookEvent } =
  await import("./webhook");

const webhookSecret = "whsec_c2VjcmV0LWZvci13ZWJob29rLXRlc3Rz";

function signWebhook(payload: string, id: string, timestamp: string) {
  const secret = Buffer.from(webhookSecret.replace(/^whsec_/, ""), "base64");

  const signature = createHmac("sha256", secret)
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");

  return `v1,${signature}`;
}

function buildBouncedPayload() {
  return JSON.stringify({
    type: "email.bounced",
    created_at: "2026-01-01T00:00:00.000Z",
    data: {
      email_id: "email_123",
      created_at: "2026-01-01T00:00:00.000Z",
      from: "ConvoForm <notifications@convoform.com>",
      to: ["owner@example.com"],
      subject: "New response for Contact form",
      bounce: {
        message: "Recipient address rejected: owner@example.com",
        subType: "General",
        type: "Permanent",
      },
    },
  });
}

describe("Resend webhook", () => {
  it("verifies a valid Svix signature", () => {
    const payload = buildBouncedPayload();
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));

    const event = verifyResendWebhookEvent({
      payload,
      headers: {
        id,
        timestamp,
        signature: signWebhook(payload, id, timestamp),
      },
      secret: webhookSecret,
    });

    expect(event.type).toBe("email.bounced");
  });

  it("rejects an invalid signature", () => {
    const payload = buildBouncedPayload();

    expect(() =>
      verifyResendWebhookEvent({
        payload,
        headers: {
          id: "msg_123",
          timestamp: String(Math.floor(Date.now() / 1000)),
          signature: "v1,invalid",
        },
        secret: webhookSecret,
      }),
    ).toThrow();
  });

  it("maps a bounce to a sanitized analytics event", () => {
    const payload = buildBouncedPayload();
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));

    const event = verifyResendWebhookEvent({
      payload,
      headers: {
        id,
        timestamp,
        signature: signWebhook(payload, id, timestamp),
      },
      secret: webhookSecret,
    });

    const analyticsEvent = toResendWebhookAnalyticsEvent(event);
    const serialized = JSON.stringify(analyticsEvent);

    expect(analyticsEvent).toEqual({
      eventName: "email:bounced",
      distinctId: "email_123",
      properties: {
        emailId: "email_123",
        eventType: "email.bounced",
        bounceType: "Permanent",
        bounceSubType: "General",
      },
    });
    expect(serialized).not.toContain("owner@example.com");
    expect(serialized).not.toContain("notifications@convoform.com");
    expect(serialized).not.toContain("Contact form");
    expect(serialized).not.toContain("Recipient address rejected");
  });

  it("maps a failed send to a sanitized analytics event", () => {
    const analyticsEvent = toResendWebhookAnalyticsEvent({
      type: "email.failed",
      created_at: "2026-01-01T00:00:00.000Z",
      data: {
        email_id: "email_456",
        created_at: "2026-01-01T00:00:00.000Z",
        from: "ConvoForm <notifications@convoform.com>",
        to: ["owner@example.com"],
        subject: "New response for Contact form",
        failed: {
          reason: "Invalid recipient owner@example.com",
        },
      },
    });

    expect(analyticsEvent).toEqual({
      eventName: "email:failed",
      distinctId: "email_456",
      properties: {
        emailId: "email_456",
        eventType: "email.failed",
      },
    });
    expect(JSON.stringify(analyticsEvent)).not.toContain("owner@example.com");
  });

  it("ignores unrelated webhook events", () => {
    const analyticsEvent = toResendWebhookAnalyticsEvent({
      type: "email.delivered",
      created_at: "2026-01-01T00:00:00.000Z",
      data: {
        email_id: "email_789",
        created_at: "2026-01-01T00:00:00.000Z",
        from: "notifications@convoform.com",
        to: ["owner@example.com"],
        subject: "New response",
      },
    });

    expect(analyticsEvent).toBeNull();
  });
});
