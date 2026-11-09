import { describe, expect, it, mock } from "bun:test";
import { signPayload } from "@convoform/common";
import {
  WebhookDeliveryAttemptError,
  loadSignedWebhookRequest,
  parseWebhookDeliveryFailure,
  reportWebhookDeliveryResult,
  sendSignedWebhookRequest,
} from "../src/webhookDeliveryWorkflow/helpers";

const secret = "internal-secret";
const baseUrl = "https://app.convoform.test";

const signedRequest = {
  deliveryId: "delivery_1",
  url: "https://example.com/hook",
  method: "POST" as const,
  headers: {
    "content-type": "application/json",
    "webhook-id": "msg_delivery_1",
  },
  body: JSON.stringify({ ok: true }),
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("webhook workflow helpers", () => {
  it("loads a signed request from the internal route", async () => {
    const fetchImpl = mock(() => Promise.resolve(jsonResponse(signedRequest)));

    const request = await loadSignedWebhookRequest({
      baseUrl,
      deliveryId: "delivery_1",
      secret,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(request).toEqual(signedRequest);

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://app.convoform.test/api/internal/webhook-delivery/delivery_1",
    );
    expect(init.method).toBe("POST");

    const headers = init.headers as Record<string, string>;
    expect(headers["X-ConvoForm-Signature"]).toBe(
      await signPayload(String(init.body), secret),
    );
    expect(JSON.parse(String(init.body))).toEqual({
      deliveryId: "delivery_1",
    });
  });

  it("strips trailing slashes from the app URL", async () => {
    const fetchImpl = mock(() => Promise.resolve(jsonResponse(signedRequest)));

    await loadSignedWebhookRequest({
      baseUrl: "https://app.convoform.test///",
      deliveryId: "delivery_1",
      secret,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const [url] = fetchImpl.mock.calls[0] as [string];
    expect(url).toBe(
      "https://app.convoform.test/api/internal/webhook-delivery/delivery_1",
    );
  });

  it("returns the status code on a 2xx response", async () => {
    const fetchImpl = mock(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );

    const result = await sendSignedWebhookRequest(signedRequest, {
      attempt: 3,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result).toMatchObject({
      statusCode: 204,
      attempt: 3,
    });
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.redirect).toBe("manual");
    expect(init.method).toBe("POST");
  });

  it("throws a retryable error for non-2xx responses and redirects", async () => {
    const fetchImpl = mock(() =>
      Promise.resolve(new Response(null, { status: 302, statusText: "Found" })),
    );

    try {
      await sendSignedWebhookRequest(signedRequest, {
        attempt: 2,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      throw new Error("expected sendSignedWebhookRequest to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookDeliveryAttemptError);
      const attemptError = error as WebhookDeliveryAttemptError;
      expect(attemptError.statusCode).toBe(302);
      expect(attemptError.attempt).toBe(2);
    }
  });

  it("records network errors without a status and redacts the endpoint URL", async () => {
    const fetchImpl = mock(() =>
      Promise.reject(new Error(`connect ECONNREFUSED ${signedRequest.url}`)),
    );

    try {
      await sendSignedWebhookRequest(signedRequest, {
        attempt: 4,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      throw new Error("expected sendSignedWebhookRequest to throw");
    } catch (error) {
      const attemptError = error as WebhookDeliveryAttemptError;
      expect(attemptError.statusCode).toBeNull();
      expect(attemptError.attempt).toBe(4);
      expect(attemptError.message).toContain("ECONNREFUSED");
      expect(attemptError.message).not.toContain("example.com");
      expect(attemptError.message).toContain("[redacted]");
    }
  });

  it("reports the final result with a valid internal signature", async () => {
    const fetchImpl = mock(() =>
      Promise.resolve(new Response(null, { status: 200 })),
    );

    await reportWebhookDeliveryResult({
      baseUrl,
      secret,
      result: {
        deliveryId: "delivery_1",
        success: false,
        statusCode: 500,
        latencyMs: 123,
        error: "HTTP 500",
        attempts: 8,
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://app.convoform.test/api/internal/webhook-delivery-result",
    );

    const headers = init.headers as Record<string, string>;
    expect(headers["X-ConvoForm-Signature"]).toBe(
      await signPayload(String(init.body), secret),
    );
  });

  it("parses status, latency and attempt from an exhausted step error", () => {
    const error = new WebhookDeliveryAttemptError({
      attempt: 8,
      statusCode: 500,
      latencyMs: 123,
      reason: "HTTP 500 Internal Server Error",
    });

    expect(parseWebhookDeliveryFailure(error, 8)).toEqual({
      statusCode: 500,
      latencyMs: 123,
      attempts: 8,
      error: "HTTP 500 Internal Server Error",
    });
  });

  it("parses the encoded message after a Workflow replay", () => {
    const error = new Error(
      "Step failed: webhook_attempt_failed status=none latency=0 attempt=5 reason=fetch failed",
    );

    expect(parseWebhookDeliveryFailure(error, 8)).toEqual({
      statusCode: null,
      latencyMs: 0,
      attempts: 5,
      error: "fetch failed",
    });
  });

  it("falls back to the configured attempt count for unknown errors", () => {
    const parsed = parseWebhookDeliveryFailure(new Error("boom"), 8);

    expect(parsed.statusCode).toBeNull();
    expect(parsed.latencyMs).toBeNull();
    expect(parsed.attempts).toBe(8);
    expect(parsed.error).toContain("boom");
  });
});
