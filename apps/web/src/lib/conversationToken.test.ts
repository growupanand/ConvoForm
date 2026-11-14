import { describe, expect, it } from "bun:test";
import { CONVERSATION_TOKEN_TTL_SECONDS } from "@convoform/common";

const secret = "web-conversation-token-test-secret";
process.env.DATABASE_URL = "postgresql://localhost/test";
process.env.INTERNAL_EMAIL_API_SECRET = secret;

const { getConversationTokenCookieName } = await import(
  "@convoform/api/src/lib/conversationToken"
);
const {
  attachConversationToken,
  clearConversationToken,
  hasValidConversationToken,
} = await import("./conversationToken");

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
    expect(setCookie).toContain("Path=/api");
    expect(setCookie).toContain(`Max-Age=${CONVERSATION_TOKEN_TTL_SECONDS}`);

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

  it("expires the cookie when the conversation finishes", async () => {
    const response = clearConversationToken(
      new Response("ok"),
      conversation.conversationId,
    );
    const setCookie = response.headers.get("set-cookie");

    expect(setCookie).toContain(
      `${getConversationTokenCookieName(conversation.conversationId)}=;`,
    );
    expect(setCookie).toContain("Path=/api");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
});
