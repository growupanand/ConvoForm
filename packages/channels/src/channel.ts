/**
 * ============================================
 * --------------- CHANNEL TYPES ---------------
 * ============================================
 *
 * Core abstractions for multi-channel input support.
 * Each channel (Telegram, WhatsApp, etc.) implements the
 * ChannelAdapter abstract class to plug into the conversation engine.
 */

/**
 * Represents an incoming message from any channel.
 *
 * @example
 * ```ts
 * const message: ChannelMessage = {
 *   text: "Hello, I want to fill out the form",
 *   senderId: "123456789",
 *   channelType: "telegram",
 *   metadata: { chatType: "private" },
 * };
 * ```
 */
export interface ChannelMessage {
  /** The text content of the message */
  text: string;
  /** Channel-specific user identifier (e.g., Telegram chat_id) */
  senderId: string;
  /** Channel type identifier (e.g., 'telegram', 'whatsapp') */
  channelType: string;
  /** Optional channel-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Represents a response to be sent back through a channel.
 *
 * @example
 * ```ts
 * const response: ChannelResponse = {
 *   text: "What is your email address?",
 *   metadata: { parseMode: "Markdown" },
 * };
 * ```
 */
export interface ChannelResponse {
  /** The text content of the response */
  text: string;
  /** Optional channel-specific metadata for formatting, etc. */
  metadata?: Record<string, unknown>;
}

/**
 * Abstract base class for channel adapters.
 *
 * Each channel (Telegram, WhatsApp, SMS, etc.) should extend this class
 * and implement all abstract methods to handle incoming webhooks and
 * outgoing messages.
 *
 * @example
 * ```ts
 * class TelegramAdapter extends ChannelAdapter {
 *   readonly channelType = "telegram";
 *
 *   parseIncoming(payload: unknown): ChannelMessage | null {
 *     // Parse Telegram webhook payload
 *   }
 *
 *   async sendMessage(senderId: string, response: ChannelResponse): Promise<void> {
 *     // Send via Telegram Bot API
 *   }
 *
 *   async verifyWebhook(request: Request): Promise<boolean> {
 *     // Verify Telegram webhook signature
 *   }
 * }
 * ```
 */
export abstract class ChannelAdapter {
  /** Unique identifier for this channel type */
  abstract readonly channelType: string;

  /**
   * Parse an incoming webhook payload into a ChannelMessage.
   * Returns null if the payload is not a valid message (e.g., a status update).
   *
   * @param payload - The raw webhook request body
   * @returns Parsed ChannelMessage or null if not a processable message
   *
   * @example
   * ```ts
   * const message = adapter.parseIncoming(telegramUpdate);
   * if (message) {
   *   await handler.handleMessage(message, opts);
   * }
   * ```
   */
  abstract parseIncoming(payload: unknown): ChannelMessage | null;

  /**
   * Send a response message back through the channel.
   *
   * @param senderId - The channel-specific user ID to send to
   * @param response - The response to send
   *
   * @example
   * ```ts
   * await adapter.sendMessage("123456789", {
   *   text: "What is your name?",
   * });
   * ```
   */
  abstract sendMessage(
    senderId: string,
    response: ChannelResponse,
  ): Promise<void>;

  /**
   * Verify the authenticity of an incoming webhook request.
   *
   * @param request - The raw HTTP request to verify
   * @returns true if the webhook is authentic, false otherwise
   *
   * @example
   * ```ts
   * const isValid = await adapter.verifyWebhook(request);
   * if (!isValid) {
   *   return new Response("Unauthorized", { status: 401 });
   * }
   * ```
   */
  abstract verifyWebhook(request: Request): Promise<boolean>;
}
