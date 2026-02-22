import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { TelegramAdapter } from "../src/adapters/telegram-adapter";
import type { TelegramUpdate } from "../src/adapters/telegram-types";

/**
 * Helper to create a valid Telegram text message update.
 */
function createTextUpdate(
  overrides: Partial<TelegramUpdate> = {},
): TelegramUpdate {
  return {
    update_id: 100001,
    message: {
      message_id: 42,
      date: 1700000000,
      chat: { id: 123456789, type: "private" },
      from: {
        id: 987654321,
        is_bot: false,
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
      },
      text: "Hello bot!",
    },
    ...overrides,
  };
}

describe("TelegramAdapter", () => {
  let adapter: TelegramAdapter;

  beforeEach(() => {
    adapter = new TelegramAdapter({
      botToken: "test-bot-token",
      secretToken: "test-secret",
    });
  });

  // ── parseIncoming ──────────────────────────────────

  describe("parseIncoming", () => {
    it("should parse a valid text message into a ChannelMessage", () => {
      const update = createTextUpdate();
      const result = adapter.parseIncoming(update);

      expect(result).not.toBeNull();
      expect(result?.text).toBe("Hello bot!");
      expect(result?.senderId).toBe("123456789");
      expect(result?.channelType).toBe("telegram");
      expect(result?.metadata).toBeDefined();
      expect(result?.metadata?.messageId).toBe(42);
      expect(result?.metadata?.chatType).toBe("private");
    });

    it("should include from user metadata when available", () => {
      const update = createTextUpdate();
      const result = adapter.parseIncoming(update);

      expect(result?.metadata?.fromUser).toEqual({
        id: 987654321,
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
      });
    });

    it("should return null for updates without a message", () => {
      const update: TelegramUpdate = { update_id: 100002 };
      const result = adapter.parseIncoming(update);
      expect(result).toBeNull();
    });

    it("should return null for messages without text (e.g., stickers)", () => {
      const update = createTextUpdate();
      // biome-ignore lint/performance/noDelete: test needs to remove property
      delete update.message?.text;
      const result = adapter.parseIncoming(update);
      expect(result).toBeNull();
    });

    it("should return null for edited messages", () => {
      const result = adapter.parseIncoming({
        update_id: 100003,
        edited_message: {
          message_id: 43,
          date: 1700000001,
          chat: { id: 123, type: "private" },
          text: "Edited text",
        },
      });
      expect(result).toBeNull();
    });

    it("should return null for channel posts", () => {
      const result = adapter.parseIncoming({
        update_id: 100004,
        channel_post: {
          message_id: 44,
          date: 1700000002,
          chat: { id: -100123, type: "channel" },
          text: "Channel post",
        },
      });
      expect(result).toBeNull();
    });
  });

  // ── sendMessage ──────────────────────────────────

  describe("sendMessage", () => {
    it("should call Telegram API with correct payload", async () => {
      const mockFetch = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, result: {} })),
      );

      await adapter.sendMessage("123456789", {
        text: "What is your name?",
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0] ?? [];
      expect(url).toBe(
        "https://api.telegram.org/bottest-bot-token/sendMessage",
      );
      expect(options?.method).toBe("POST");

      const body = JSON.parse(options?.body as string);
      expect(body.chat_id).toBe("123456789");
      expect(body.text).toBe("What is your name?");

      mockFetch.mockRestore();
    });

    it("should throw on Telegram API error", async () => {
      const mockFetch = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: false,
            description: "Bad Request: chat not found",
            error_code: 400,
          }),
        ),
      );

      await expect(
        adapter.sendMessage("invalid_id", { text: "test" }),
      ).rejects.toThrow("Telegram sendMessage failed");

      mockFetch.mockRestore();
    });
  });

  // ── verifyWebhook ──────────────────────────────────

  describe("verifyWebhook", () => {
    it("should accept requests with matching secret token", async () => {
      const request = new Request("https://example.com/webhook", {
        headers: {
          "x-telegram-bot-api-secret-token": "test-secret",
        },
      });

      const isValid = await adapter.verifyWebhook(request);
      expect(isValid).toBe(true);
    });

    it("should reject requests with wrong secret token", async () => {
      const request = new Request("https://example.com/webhook", {
        headers: {
          "x-telegram-bot-api-secret-token": "wrong-secret",
        },
      });

      const isValid = await adapter.verifyWebhook(request);
      expect(isValid).toBe(false);
    });

    it("should reject requests with missing secret token header", async () => {
      const request = new Request("https://example.com/webhook");
      const isValid = await adapter.verifyWebhook(request);
      expect(isValid).toBe(false);
    });

    it("should accept all requests when no secretToken is configured", async () => {
      const adapterNoSecret = new TelegramAdapter({
        botToken: "test-bot-token",
      });

      const request = new Request("https://example.com/webhook");
      const isValid = await adapterNoSecret.verifyWebhook(request);
      expect(isValid).toBe(true);
    });
  });

  // ── setWebhook ──────────────────────────────────

  describe("setWebhook", () => {
    it("should call setWebhook API with URL and secret token", async () => {
      const mockFetch = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            result: true,
            description: "Webhook was set",
          }),
        ),
      );

      const result = await adapter.setWebhook(
        "https://channels.example.com/webhook/telegram/form_abc",
      );

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [url, options] = mockFetch.mock.calls[0] ?? [];
      expect(url).toBe("https://api.telegram.org/bottest-bot-token/setWebhook");

      const body = JSON.parse(options?.body as string);
      expect(body.url).toBe(
        "https://channels.example.com/webhook/telegram/form_abc",
      );
      expect(body.secret_token).toBe("test-secret");

      mockFetch.mockRestore();
    });
  });
});
