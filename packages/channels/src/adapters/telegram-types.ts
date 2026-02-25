/**
 * ============================================
 * ------------ TELEGRAM API TYPES -----------
 * ============================================
 *
 * Minimal TypeScript interfaces for the Telegram Bot API.
 * Only includes what we need — no external dependency required.
 *
 * @see https://core.telegram.org/bots/api
 */

/**
 * Represents a Telegram chat (private, group, supergroup, or channel).
 *
 * @example
 * ```ts
 * const chat: TelegramChat = { id: 123456789, type: "private" };
 * ```
 */
export interface TelegramChat {
  /** Unique identifier for the chat */
  id: number;
  /** Type of chat: private, group, supergroup, or channel */
  type: "private" | "group" | "supergroup" | "channel";
  /** Optional title for groups/channels */
  title?: string;
  /** Optional username for private chats */
  username?: string;
  /** Optional first name for private chats */
  first_name?: string;
  /** Optional last name for private chats */
  last_name?: string;
}

/**
 * Represents a Telegram user.
 *
 * @example
 * ```ts
 * const user: TelegramUser = {
 *   id: 987654321,
 *   is_bot: false,
 *   first_name: "John",
 * };
 * ```
 */
export interface TelegramUser {
  /** Unique identifier for the user */
  id: number;
  /** True if the user is a bot */
  is_bot: boolean;
  /** User's first name */
  first_name: string;
  /** Optional last name */
  last_name?: string;
  /** Optional username */
  username?: string;
  /** Optional IETF language tag */
  language_code?: string;
}

/**
 * Represents a Telegram message.
 *
 * @example
 * ```ts
 * const message: TelegramMessage = {
 *   message_id: 42,
 *   date: 1700000000,
 *   chat: { id: 123, type: "private" },
 *   text: "Hello bot!",
 * };
 * ```
 */
export interface TelegramMessage {
  /** Unique message identifier within the chat */
  message_id: number;
  /** Sender (empty for messages in channels) */
  from?: TelegramUser;
  /** Chat the message belongs to */
  chat: TelegramChat;
  /** Date the message was sent (Unix timestamp) */
  date: number;
  /** Text content of the message (if any) */
  text?: string;
}

/**
 * Represents an incoming update from Telegram's webhook or getUpdates.
 *
 * We only handle `message` with text content. Other update types
 * (edited_message, channel_post, callback_query, etc.) are ignored.
 *
 * @example
 * ```ts
 * const update: TelegramUpdate = {
 *   update_id: 100001,
 *   message: {
 *     message_id: 42,
 *     date: 1700000000,
 *     chat: { id: 123, type: "private" },
 *     text: "My name is John",
 *   },
 * };
 * ```
 */
export interface TelegramUpdate {
  /** The update's unique identifier */
  update_id: number;
  /** New incoming message (text, photo, sticker, etc.) */
  message?: TelegramMessage;
  /** Edited message (ignored) */
  edited_message?: TelegramMessage;
  /** Channel post (ignored) */
  channel_post?: TelegramMessage;
}

/**
 * Response shape from Telegram Bot API calls.
 *
 * @example
 * ```ts
 * const res: TelegramApiResponse<TelegramMessage> = {
 *   ok: true,
 *   result: { message_id: 1, date: 1700000000, chat: { id: 123, type: "private" } },
 * };
 * ```
 */
export interface TelegramApiResponse<T = unknown> {
  /** Whether the request was successful */
  ok: boolean;
  /** Result data (present when ok is true) */
  result?: T;
  /** Error description (present when ok is false) */
  description?: string;
  /** Error code (present when ok is false) */
  error_code?: number;
}
