import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { ILogger, ITimer } from "@convoform/logger";
import { ChannelAnalytics, createChannelLogger } from "../src/analytics";

/**
 * Create a mock ILogger for testing analytics calls.
 *
 * @example
 * ```ts
 * const logger = createMockLogger();
 * const analytics = new ChannelAnalytics(logger);
 * analytics.trackWebhookReceived("telegram", "bot_1", "user_1");
 * expect(logger.info).toHaveBeenCalled();
 * ```
 */
function createMockLogger(): ILogger & {
  info: ReturnType<typeof mock>;
  error: ReturnType<typeof mock>;
  warn: ReturnType<typeof mock>;
  debug: ReturnType<typeof mock>;
  startTimer: ReturnType<typeof mock>;
  withContext: ReturnType<typeof mock>;
} {
  const mockTimer: ITimer = {
    checkpoint: mock(() => 0),
    end: mock(() => 0),
    getElapsed: () => 0,
  };

  const logger: any = {
    info: mock(() => undefined),
    error: mock(() => undefined),
    warn: mock(() => undefined),
    debug: mock(() => undefined),
    startTimer: mock(() => mockTimer),
    withContext: mock(() => logger),
  };

  return logger;
}

describe("createChannelLogger", () => {
  it("should create a child logger with channel context", () => {
    const baseLogger = createMockLogger();
    const channelLogger = createChannelLogger("telegram", baseLogger);

    expect(baseLogger.withContext).toHaveBeenCalledWith({
      component: "channels",
      channelType: "telegram",
    });
    expect(channelLogger).toBeDefined();
  });
});

describe("ChannelAnalytics", () => {
  let logger: ReturnType<typeof createMockLogger>;
  let analytics: ChannelAnalytics;

  beforeEach(() => {
    logger = createMockLogger();
    analytics = new ChannelAnalytics(logger);
  });

  describe("trackWebhookReceived", () => {
    it("should log webhook received event with correct context", () => {
      analytics.trackWebhookReceived("telegram", "bot_123", "user_456");

      // withContext is called in the constructor, then info is called on the child
      // Since our mock returns itself from withContext, info should be called on logger
      expect(logger.info).toHaveBeenCalledWith("webhook.received", {
        channelType: "telegram",
        botId: "bot_123",
        senderId: "user_456",
        event: "webhook.received",
      });
    });
  });

  describe("trackMessageProcessed", () => {
    it("should log message processed with duration", () => {
      analytics.trackMessageProcessed(
        "telegram",
        "bot_123",
        "user_456",
        "form_abc",
        1234.567,
      );

      expect(logger.info).toHaveBeenCalledWith("message.processed", {
        channelType: "telegram",
        botId: "bot_123",
        senderId: "user_456",
        formId: "form_abc",
        duration: 1234.57,
        event: "message.processed",
      });
    });

    it("should round duration to 2 decimal places", () => {
      analytics.trackMessageProcessed(
        "telegram",
        "bot_1",
        "user_1",
        "form_1",
        100.123456,
      );

      const call = (logger.info as any).mock.calls[0];
      expect(call[1].duration).toBe(100.12);
    });
  });

  describe("trackResponseSent", () => {
    it("should log response sent with length", () => {
      analytics.trackResponseSent("telegram", "bot_123", "user_456", 142);

      expect(logger.info).toHaveBeenCalledWith("response.sent", {
        channelType: "telegram",
        botId: "bot_123",
        senderId: "user_456",
        responseLength: 142,
        event: "response.sent",
      });
    });
  });

  describe("trackWebhookSetup", () => {
    it("should log at info level on success", () => {
      analytics.trackWebhookSetup("telegram", "bot_123", true);

      expect(logger.info).toHaveBeenCalledWith("webhook.setup", {
        channelType: "telegram",
        botId: "bot_123",
        success: true,
        event: "webhook.setup",
      });
    });

    it("should log at error level on failure", () => {
      analytics.trackWebhookSetup("telegram", "bot_123", false);

      expect(logger.error).toHaveBeenCalledWith("webhook.setup", {
        channelType: "telegram",
        botId: "bot_123",
        success: false,
        event: "webhook.setup",
      });
    });
  });

  describe("trackWebhookTeardown", () => {
    it("should log at info level on success", () => {
      analytics.trackWebhookTeardown("telegram", "bot_123", true);

      expect(logger.info).toHaveBeenCalledWith("webhook.teardown", {
        channelType: "telegram",
        botId: "bot_123",
        success: true,
        event: "webhook.teardown",
      });
    });

    it("should log at error level on failure", () => {
      analytics.trackWebhookTeardown("telegram", "bot_123", false);

      expect(logger.error).toHaveBeenCalledWith("webhook.teardown", {
        channelType: "telegram",
        botId: "bot_123",
        success: false,
        event: "webhook.teardown",
      });
    });
  });

  describe("trackError", () => {
    it("should log error with Error instance details", () => {
      const error = new Error("Something went wrong");
      analytics.trackError("handle_webhook", error, { botId: "bot_123" });

      expect(logger.error).toHaveBeenCalledWith(
        "handle_webhook.error",
        expect.objectContaining({
          operation: "handle_webhook",
          errorMessage: "Something went wrong",
          errorStack: expect.any(String),
          botId: "bot_123",
          event: "handle_webhook.error",
        }),
      );
    });

    it("should handle non-Error values", () => {
      analytics.trackError("send_message", "string error");

      expect(logger.error).toHaveBeenCalledWith(
        "send_message.error",
        expect.objectContaining({
          operation: "send_message",
          errorMessage: "string error",
          errorStack: undefined,
          event: "send_message.error",
        }),
      );
    });
  });

  describe("startRequestTrace", () => {
    it("should start a timer with channel context", () => {
      const timer = analytics.startRequestTrace("telegram", "handle_webhook");

      expect(logger.startTimer).toHaveBeenCalledWith("handle_webhook", {
        channelType: "telegram",
        event: "handle_webhook.trace",
      });
      expect(timer).toBeDefined();
      expect(timer.checkpoint).toBeDefined();
      expect(timer.end).toBeDefined();
    });
  });
});
