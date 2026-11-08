import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const trackMock = mock(() => Promise.resolve());
const verifyWebhookMock = mock();
const toAnalyticsEventMock = mock();

mock.module("@convoform/analytics", () => ({
  analytics: { track: trackMock },
}));

mock.module("@convoform/email", () => ({
  verifyResendWebhookEvent: verifyWebhookMock,
  toResendWebhookAnalyticsEvent: toAnalyticsEventMock,
}));

const { POST } = await import("./route");

function buildRequest() {
  return new NextRequest("http://localhost/api/webhook/resend", {
    method: "POST",
    headers: {
      "svix-id": "msg_123",
      "svix-timestamp": "1767225600",
      "svix-signature": "v1,signature",
    },
    body: JSON.stringify({ type: "email.bounced" }),
  });
}

describe("Resend webhook route", () => {
  beforeEach(() => {
    trackMock.mockClear();
    verifyWebhookMock.mockClear();
    toAnalyticsEventMock.mockClear();
  });

  it("returns 400 when the signature is invalid", async () => {
    verifyWebhookMock.mockImplementationOnce(() => {
      throw new Error("Invalid signature");
    });

    const response = await POST(buildRequest());

    expect(response.status).toBe(400);
    expect(trackMock).not.toHaveBeenCalled();
  });

  it("records a sanitized analytics event for a verified bounce", async () => {
    verifyWebhookMock.mockReturnValueOnce({ type: "email.bounced" });
    toAnalyticsEventMock.mockReturnValueOnce({
      eventName: "email:bounced",
      distinctId: "email_123",
      properties: {
        emailId: "email_123",
        eventType: "email.bounced",
        bounceType: "Permanent",
        bounceSubType: "General",
      },
    });

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(trackMock).toHaveBeenCalledWith("email:bounced", {
      distinctId: "email_123",
      properties: {
        emailId: "email_123",
        eventType: "email.bounced",
        bounceType: "Permanent",
        bounceSubType: "General",
      },
    });
  });

  it("acknowledges verified events even when analytics fails", async () => {
    verifyWebhookMock.mockReturnValueOnce({ type: "email.failed" });
    toAnalyticsEventMock.mockReturnValueOnce({
      eventName: "email:failed",
      distinctId: "email_456",
      properties: {
        emailId: "email_456",
        eventType: "email.failed",
      },
    });
    trackMock.mockImplementationOnce(() =>
      Promise.reject(new Error("PostHog unavailable")),
    );

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
  });
});
