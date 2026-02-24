/**
 * ============================================
 * ---------- CHANNEL ANALYTICS ---------------
 * ============================================
 *
 * Structured analytics and tracing for channel operations.
 *
 * Wraps the generic @convoform/logger with domain-specific
 * tracking methods for channel events (webhooks, messages,
 * setup/teardown). All events are structured log entries
 * queryable in Axiom or any configured transport.
 */

import { getLogger } from "@convoform/logger";
import type { ILogger, ITimer, LogContext } from "@convoform/logger";

/**
 * Create a channel-scoped logger instance.
 *
 * Returns a child logger with persistent `component` and `channelType`
 * context, so every log entry is automatically tagged.
 *
 * @param channelType - The channel type (e.g., 'telegram', 'whatsapp')
 * @param logger - Optional base logger instance (defaults to singleton)
 * @returns A child logger scoped to the given channel
 *
 * @example
 * ```ts
 * const log = createChannelLogger("telegram");
 * log.info("Webhook received", { botId: "123" });
 * // => { component: "channels", channelType: "telegram", botId: "123", ... }
 * ```
 */
export function createChannelLogger(
  channelType: string,
  logger?: ILogger,
): ILogger {
  const base = logger ?? getLogger();
  return base.withContext({
    component: "channels",
    channelType,
  });
}

/**
 * Domain-specific analytics tracker for channel operations.
 *
 * Provides named methods for each trackable event, ensuring
 * consistent log structure and making it easy to query events
 * in Axiom dashboards.
 *
 * @example
 * ```ts
 * const analytics = new ChannelAnalytics();
 *
 * // Track an incoming webhook
 * analytics.trackWebhookReceived("telegram", "bot_123", "sender_456");
 *
 * // Time a full request
 * const timer = analytics.startRequestTrace("telegram", "handle_webhook");
 * // ... do work ...
 * timer.checkpoint("parsed_message");
 * // ... more work ...
 * timer.end({ success: true });
 * ```
 */
export class ChannelAnalytics {
  private logger: ILogger;

  constructor(logger?: ILogger) {
    this.logger = (logger ?? getLogger()).withContext({
      component: "channels",
    });
  }

  /**
   * Track an incoming webhook event.
   *
   * @param channelType - The channel type (e.g., 'telegram')
   * @param botId - The bot/channel identifier
   * @param senderId - The sender's channel-specific ID
   * @param conversationId - Optional conversation ID for correlation
   *
   * @example
   * ```ts
   * analytics.trackWebhookReceived("telegram", "bot_123", "user_456", "conv_789");
   * ```
   */
  trackWebhookReceived(
    channelType: string,
    botId: string,
    senderId: string,
    conversationId?: string,
  ): void {
    this.logger.info("webhook.received", {
      channelType,
      botId,
      senderId,
      ...(conversationId && { conversationId }),
      event: "webhook.received",
    });
  }

  /**
   * Track a fully processed message with timing data.
   *
   * @param channelType - The channel type
   * @param botId - The bot/channel identifier
   * @param senderId - The sender's channel-specific ID
   * @param formId - The form being filled
   * @param durationMs - Total processing time in milliseconds
   * @param conversationId - Optional conversation ID for correlation
   *
   * @example
   * ```ts
   * analytics.trackMessageProcessed("telegram", "bot_123", "user_456", "form_abc", 1250, "conv_789");
   * ```
   */
  trackMessageProcessed(
    channelType: string,
    botId: string,
    senderId: string,
    formId: string,
    durationMs: number,
    conversationId?: string,
  ): void {
    this.logger.info("message.processed", {
      channelType,
      botId,
      senderId,
      formId,
      duration: Math.round(durationMs * 100) / 100,
      ...(conversationId && { conversationId }),
      event: "message.processed",
    });
  }

  /**
   * Track an outgoing response sent through a channel.
   *
   * @param channelType - The channel type
   * @param botId - The bot/channel identifier
   * @param senderId - The recipient's channel-specific ID
   * @param responseLength - Character length of the response text
   * @param conversationId - Optional conversation ID for correlation
   *
   * @example
   * ```ts
   * analytics.trackResponseSent("telegram", "bot_123", "user_456", 142, "conv_789");
   * ```
   */
  trackResponseSent(
    channelType: string,
    botId: string,
    senderId: string,
    responseLength: number,
    conversationId?: string,
  ): void {
    this.logger.info("response.sent", {
      channelType,
      botId,
      senderId,
      responseLength,
      ...(conversationId && { conversationId }),
      event: "response.sent",
    });
  }

  /**
   * Track a webhook setup (registration) event.
   *
   * @param channelType - The channel type
   * @param botId - The bot/channel identifier
   * @param success - Whether the setup succeeded
   *
   * @example
   * ```ts
   * analytics.trackWebhookSetup("telegram", "bot_123", true);
   * ```
   */
  trackWebhookSetup(
    channelType: string,
    botId: string,
    success: boolean,
  ): void {
    const level = success ? "info" : "error";
    this.logger[level]("webhook.setup", {
      channelType,
      botId,
      success,
      event: "webhook.setup",
    });
  }

  /**
   * Track a webhook teardown (deregistration) event.
   *
   * @param channelType - The channel type
   * @param botId - The bot/channel identifier
   * @param success - Whether the teardown succeeded
   *
   * @example
   * ```ts
   * analytics.trackWebhookTeardown("telegram", "bot_123", true);
   * ```
   */
  trackWebhookTeardown(
    channelType: string,
    botId: string,
    success: boolean,
  ): void {
    const level = success ? "info" : "error";
    this.logger[level]("webhook.teardown", {
      channelType,
      botId,
      success,
      event: "webhook.teardown",
    });
  }

  /**
   * Track an error with operation context and stack trace.
   *
   * @param operation - The operation that failed (e.g., 'handle_webhook')
   * @param error - The error that occurred
   * @param context - Additional context about the failure (include conversationId when available)
   *
   * @example
   * ```ts
   * try {
   *   await processMessage();
   * } catch (err) {
   *   analytics.trackError("handle_webhook", err, { botId: "123", conversationId: "conv_789" });
   * }
   * ```
   */
  trackError(operation: string, error: unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`${operation}.error`, {
      ...context,
      operation,
      errorMessage,
      errorStack,
      event: `${operation}.error`,
    });
  }

  /**
   * Start a performance trace for a channel operation.
   *
   * Returns an `ITimer` that supports checkpoints and a final `end()`.
   *
   * @param channelType - The channel type
   * @param operation - The operation name (e.g., 'handle_webhook', 'send_message')
   * @param conversationId - Optional conversation ID for correlation
   * @returns An ITimer for tracking performance
   *
   * @example
   * ```ts
   * const timer = analytics.startRequestTrace("telegram", "handle_webhook", "conv_789");
   * timer.checkpoint("verified_webhook");
   * timer.checkpoint("parsed_message");
   * timer.checkpoint("ai_response_consumed");
   * const totalMs = timer.end({ success: true });
   * ```
   */
  startRequestTrace(
    channelType: string,
    operation: string,
    conversationId?: string,
  ): ITimer {
    return this.logger.startTimer(operation, {
      channelType,
      ...(conversationId && { conversationId }),
      event: `${operation}.trace`,
    });
  }
}
