import { describe, expect, it } from "bun:test";
import { createConversationToken } from "@convoform/common";
import { NextRequest } from "next/server";

const secret = "finish-conversation-token-test-secret";
process.env.DATABASE_URL = "postgresql://localhost/test";
process.env.INTERNAL_EMAIL_API_SECRET = secret;

const { getConversationTokenCookieName } = await import(
  "@convoform/api/src/lib/conversationToken"
);
const { POST } = await import("./route");

const conversationId = "conv_1";

async function buildRequest(token?: string) {
  const headers = new Headers({
    "content-type": "application/json",
  });

  if (token) {
    headers.set(
      "cookie",
      `${getConversationTokenCookieName(conversationId)}=${token}`,
    );
  }

  return new NextRequest("http://localhost/api/conversation/finish", {
    method: "POST",
    headers,
    body: JSON.stringify({ conversationId }),
  });
}

async function createToken(forConversationId = conversationId) {
  return await createConversationToken(
    {
      conversationId: forConversationId,
      formId: "form_1",
      organizationId: "org_1",
    },
    { secret },
  );
}

describe("finish conversation route", () => {
  it("expires the conversation cookie", async () => {
    const token = await createToken();

    const response = await POST(await buildRequest(token));
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(setCookie).toContain(
      `${getConversationTokenCookieName(conversationId)}=;`,
    );
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("Path=/api");
  });

  it("rejects a request without the conversation token", async () => {
    const response = await POST(await buildRequest());

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
