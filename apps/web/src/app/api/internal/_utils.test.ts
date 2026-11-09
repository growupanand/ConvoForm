import { describe, expect, it, mock } from "bun:test";
import { signPayload } from "@convoform/common";
import { NextRequest } from "next/server";

const secret = "test-internal-secret";

mock.module("@convoform/api/src/env", () => ({
  env: {
    INTERNAL_EMAIL_API_SECRET: secret,
  },
}));

const { verifyInternalRequest } = await import("./_utils");

function buildRequest({
  body,
  signature,
}: {
  body?: string;
  signature?: string;
}) {
  const headers = new Headers();
  if (signature) {
    headers.set("X-ConvoForm-Signature", signature);
  }

  return new NextRequest("http://localhost/api/internal/test", {
    method: "POST",
    headers,
    body,
  });
}

describe("internal request verification", () => {
  it("rejects a request without a signature", async () => {
    const result = await verifyInternalRequest(
      buildRequest({ body: JSON.stringify({ id: "1" }) }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it("rejects an invalid signature", async () => {
    const result = await verifyInternalRequest(
      buildRequest({
        body: JSON.stringify({ id: "1" }),
        signature: await signPayload("different body", secret),
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it("rejects a signature over a modified body", async () => {
    const body = JSON.stringify({ id: "1" });
    const result = await verifyInternalRequest(
      buildRequest({
        body: `${body} `,
        signature: await signPayload(body, secret),
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it("accepts a valid signature and returns the raw body", async () => {
    const body = JSON.stringify({ id: "1" });
    const result = await verifyInternalRequest(
      buildRequest({
        body,
        signature: await signPayload(body, secret),
      }),
    );

    expect(result).toEqual({ ok: true, rawBody: body });
  });
});
