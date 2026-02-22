/**
 * ============================================
 * ----------- TELEGRAM ADAPTER ---------------
 * ============================================
 *
 * Implements the ChannelAdapter for Telegram Bot API.
 *
 * - Parses incoming webhook updates (only text messages)
 * - Sends responses via `sendMessage` API
 * - Verifies webhook authenticity via `X-Telegram-Bot-Api-Secret-Token` header
 *
 * @see https://core.telegram.org/bots/api
 */

import {
  ChannelAdapter,
  type ChannelMessage,
  type ChannelResponse,
} from "../channel";
import type {
  TelegramApiResponse,
  TelegramMessage,
  TelegramUpdate,
} from "./telegram-types";

const TELEGRAM_API_BASE = "https://api.telegram.org";

/**
 * Configuration for the TelegramAdapter.
 *
 * @example
 * ```ts
 * const config: TelegramAdapterConfig = {
 *   botToken: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
 *   secretToken: "my-webhook-secret",
 * };
 * ```
 */
export interface TelegramAdapterConfig {
  /** The bot token from @BotFather */
  botToken: string;
  /**
   * Optional secret token for webhook verification.
   * Set this when calling `setWebhook` with `secret_token` parameter.
   * The header `X-Telegram-Bot-Api-Secret-Token` will be checked against this.
   */
  secretToken?: string;
}

/**
 * Telegram channel adapter.
 *
 * Handles parsing incoming Telegram webhook payloads, sending messages
 * back via the Bot API, and verifying webhook authenticity.
 *
 * @example
 * ```ts
 * const adapter = new TelegramAdapter({
 *   botToken: "123456:ABC-DEF...",
 *   secretToken: "my-secret",
 * });
 *
 * // Parse an incoming webhook
 * const message = adapter.parseIncoming(webhookBody);
 * if (message) {
 *   await adapter.sendMessage(message.senderId, { text: "Hello!" });
 * }
 * ```
 */
export class TelegramAdapter extends ChannelAdapter {
  readonly channelType = "telegram";
  private botToken: string;
  private secretToken?: string;

  constructor(config: TelegramAdapterConfig) {
    super();
    this.botToken = config.botToken;
    this.secretToken = config.secretToken;
  }

  /**
   * Parse an incoming Telegram webhook update into a ChannelMessage.
   *
   * Only text messages are processed. Non-text updates (stickers, photos,
   * edited messages, channel posts, etc.) return null.
   *
   * @param payload - The raw Telegram Update JSON body
   * @returns A ChannelMessage if it's a text message, null otherwise
   *
   * @example
   * ```ts
   * const msg = adapter.parseIncoming({
   *   update_id: 100001,
   *   message: {
   *     message_id: 42,
   *     date: 1700000000,
   *     chat: { id: 123, type: "private" },
   *     from: { id: 456, is_bot: false, first_name: "John" },
   *     text: "My name is John",
   *   },
   * });
   * // msg = { text: "My name is John", senderId: "123", channelType: "telegram", metadata: {...} }
   * ```
   */
  parseIncoming(payload: unknown): ChannelMessage | null {
    const update = payload as TelegramUpdate;

    // Only handle regular text messages
    if (!update.message?.text) {
      return null;
    }

    const message = update.message;

    return {
      // biome-ignore lint/style/noNonNullAssertion: narrowed by the guard above
      text: message.text!,
      senderId: String(message.chat.id),
      channelType: this.channelType,
      metadata: {
        messageId: message.message_id,
        chatType: message.chat.type,
        fromUser: message.from
          ? {
              id: message.from.id,
              firstName: message.from.first_name,
              lastName: message.from.last_name,
              username: message.from.username,
            }
          : undefined,
      },
    };
  }

  /**
   * Send a text message back to a Telegram chat.
   *
   * @param senderId - The Telegram chat ID (as string) to send to
   * @param response - The response containing the text to send
   * @throws Error if the Telegram API returns an error
   *
   * @example
   * ```ts
   * await adapter.sendMessage("123456789", {
   *   text: "What is your email address?",
   * });
   * ```
   */
  async sendMessage(
    senderId: string,
    response: ChannelResponse,
  ): Promise<void> {
    const url = `${TELEGRAM_API_BASE}/bot${this.botToken}/sendMessage`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: senderId,
        text: response.text,
      }),
    });

    const data = (await res.json()) as TelegramApiResponse<TelegramMessage>;

    if (!data.ok) {
      throw new Error(
        `Telegram sendMessage failed: ${data.description ?? "Unknown error"} (code: ${data.error_code})`,
      );
    }
  }

  /**
   * Verify that an incoming webhook request is authentic.
   *
   * If no `secretToken` was configured, all requests are accepted.
   * Otherwise, the `X-Telegram-Bot-Api-Secret-Token` header must match.
   *
   * @param request - The incoming HTTP request
   * @returns true if the webhook is authentic
   *
   * @example
   * ```ts
   * const isValid = await adapter.verifyWebhook(request);
   * if (!isValid) {
   *   return new Response("Unauthorized", { status: 401 });
   * }
   * ```
   */
  async verifyWebhook(request: Request): Promise<boolean> {
    // If no secret token configured, accept all (for development)
    if (!this.secretToken) {
      return true;
    }

    const headerToken = request.headers.get("x-telegram-bot-api-secret-token");
    return headerToken === this.secretToken;
  }

  /**
   * Register a webhook URL with Telegram.
   *
   * Call this once to tell Telegram where to send updates.
   *
   * @param webhookUrl - The public HTTPS URL for receiving updates
   * @returns The Telegram API response
   * @throws Error if the API call fails
   *
   * @example
   * ```ts
   * await adapter.setWebhook("https://channels.example.com/webhook/telegram/form_abc");
   * ```
   */
  async setWebhook(webhookUrl: string): Promise<TelegramApiResponse<boolean>> {
    const url = `${TELEGRAM_API_BASE}/bot${this.botToken}/setWebhook`;

    const body: Record<string, unknown> = { url: webhookUrl };
    if (this.secretToken) {
      body.secret_token = this.secretToken;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return (await res.json()) as TelegramApiResponse<boolean>;
  }

  /**
   * Remove the webhook from Telegram (switch back to getUpdates polling).
   *
   * @returns The Telegram API response
   *
   * @example
   * ```ts
   * await adapter.deleteWebhook();
   * ```
   */
  async deleteWebhook(): Promise<TelegramApiResponse<boolean>> {
    const url = `${TELEGRAM_API_BASE}/bot${this.botToken}/deleteWebhook`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    return (await res.json()) as TelegramApiResponse<boolean>;
  }
}
