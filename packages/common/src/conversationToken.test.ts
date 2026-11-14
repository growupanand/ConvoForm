import { describe, expect, it } from "bun:test";
import {
  CONVERSATION_TOKEN_TTL_SECONDS,
  createConversationToken,
  verifyConversationToken,
} from "./conversationToken";

const secret = "conversation-token-test-secret";
const payload = {
  conversationId: "conv_1",
  formId: "form_1",
  organizationId: "org_1",
};
const nowSeconds = 1_767_225_600;

describe("conversation token", () => {
  it("round-trips a token bound to one conversation", async () => {
    const token = await createConversationToken(payload, {
      secret,
      nowSeconds,
    });

    const verified = await verifyConversationToken(token, {
      secret,
      conversationId: payload.conversationId,
      nowSeconds,
    });

    expect(verified).toEqual({
      ...payload,
      expiresAt: nowSeconds + CONVERSATION_TOKEN_TTL_SECONDS,
    });
  });

  it("rejects a token for another conversation", async () => {
    const token = await createConversationToken(payload, {
      secret,
      nowSeconds,
    });

    await expect(
      verifyConversationToken(token, {
        secret,
        conversationId: "conv_2",
        nowSeconds,
      }),
    ).resolves.toBeNull();
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createConversationToken(payload, {
      secret,
      nowSeconds,
    });

    await expect(
      verifyConversationToken(token, {
        secret: "another-secret",
        nowSeconds,
      }),
    ).resolves.toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createConversationToken(payload, {
      secret,
      nowSeconds,
    });
    const [version, , signature] = token.split(".");
    const tamperedPayload = btoa(
      JSON.stringify({ ...payload, organizationId: "org_2" }),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await expect(
      verifyConversationToken(`${version}.${tamperedPayload}.${signature}`, {
        secret,
        nowSeconds,
      }),
    ).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createConversationToken(payload, {
      secret,
      nowSeconds,
      expiresInSeconds: 60,
    });

    await expect(
      verifyConversationToken(token, {
        secret,
        nowSeconds: nowSeconds + 60,
      }),
    ).resolves.toBeNull();
  });
});
