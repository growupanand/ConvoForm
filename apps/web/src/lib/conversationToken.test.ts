import { describe, expect, it } from "bun:test";

const secret = "web-conversation-token-test-secret";
process.env.DATABASE_URL = "postgresql://localhost/test";
process.env.INTERNAL_EMAIL_API_SECRET = secret;

const { getConversationTokenCookieName } = await import(
  "@convoform/api/src/lib/conversationToken"
);
const { attachConversationToken, hasValidConversationToken } = await import(
  "./conversationToken"
);

const conversation = {
  conversationId: "conv_1",
  formId: "form_1",
  organizationId: "org_1",
};

function cookieHeaderFrom(response: Response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    return "";
  }

  return setCookie.split(";")[0] ?? "";
}

describe("web conversation token cookie", () => {
  it("issues an HttpOnly cookie and verifies it on later requests", async () => {
    const response = await attachConversationToken(
      new Response("ok"),
      conversation,
    );
    const setCookie = response.headers.get("set-cookie");

    expect(setCookie).toContain(
      getConversationTokenCookieName(conversation.conversationId),
    );
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");

    const request = new Request("http://localhost/api/conversation", {
      headers: {
        cookie: cookieHeaderFrom(response),
      },
    });

    await expect(
      hasValidConversationToken(request, conversation.conversationId),
    ).resolves.toBe(true);
    await expect(
      hasValidConversationToken(request, "conv_other"),
    ).resolves.toBe(false);
  });

  it("rejects a request with no token", async () => {
    const request = new Request("http://localhost/api/conversation");

    await expect(
      hasValidConversationToken(request, conversation.conversationId),
    ).resolves.toBe(false);
  });
});
