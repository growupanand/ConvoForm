import { describe, expect, it, mock } from "bun:test";
import {
  sendWebhookAttempt,
  sendWebhookWithRetries,
} from "../src/actions/webhook/deliverWebhook";

const request = {
  deliveryId: "delivery_1",
  url: "https://example.com/hook",
  method: "POST" as const,
  headers: {
    "content-type": "application/json",
    "webhook-id": "msg_delivery_1",
  },
  body: JSON.stringify({ ok: true }),
};

function response(status: number, statusText = "") {
  return new Response(null, { status, statusText });
}

describe("self-host webhook delivery", () => {
  it("succeeds on the first attempt", async () => {
    const fetchImpl = mock(() => Promise.resolve(response(200, "OK")));

    const { result, attempts } = await sendWebhookWithRetries(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      retryDelaysMs: [0, 1000, 5000],
    });

    expect(attempts).toBe(1);
    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      error: null,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("retries twice and succeeds on the third attempt", async () => {
    const fetchImpl = mock()
      .mockResolvedValueOnce(response(500, "Internal Server Error"))
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValueOnce(response(204));

    const { result, attempts } = await sendWebhookWithRetries(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      retryDelaysMs: [0, 0, 0],
    });

    expect(attempts).toBe(3);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(204);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("returns the last failure after all retries are exhausted", async () => {
    const fetchImpl = mock(() => Promise.resolve(response(503, "Unavailable")));

    const { result, attempts } = await sendWebhookWithRetries(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      retryDelaysMs: [0, 0, 0],
    });

    expect(attempts).toBe(3);
    expect(result).toMatchObject({
      success: false,
      statusCode: 503,
    });
    expect(result.error).toContain("HTTP 503");
  });

  it("treats redirects as a failed attempt and never follows them", async () => {
    const fetchImpl = mock(() => Promise.resolve(response(302, "Found")));

    const result = await sendWebhookAttempt(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(302);

    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    expect(init.redirect).toBe("manual");
    expect(init.method).toBe("POST");
  });

  it("records a network error without a status code", async () => {
    const result = await sendWebhookAttempt(request, {
      fetchImpl: (() =>
        Promise.reject(
          new Error("connect ECONNREFUSED"),
        )) as unknown as typeof fetch,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBeNull();
    expect(result.error).toContain("ECONNREFUSED");
  });
});
