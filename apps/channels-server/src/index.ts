/**
 * ============================================
 * ----------- CHANNELS SERVER ----------------
 * ============================================
 *
 * Bun HTTP server that receives webhooks from external channels
 * (Telegram, WhatsApp, etc.) and routes them through the
 * channel adapter → conversation handler pipeline.
 *
 * Routes:
 *   GET  /healthcheck               — Health check
 *   POST /webhook/telegram/:formId  — Receive Telegram updates
 *   POST /setup/telegram            — Register webhook URL with Telegram
 */

import {
  ChannelConversationHandler,
  SessionManager,
  TelegramAdapter,
} from "@convoform/channels";
import {
  type TelegramChannelConfig,
  buildConversationOperations,
  getChannelConnection,
} from "./db-operations";

const PORT = process.env.CHANNELS_SERVER_PORT ?? 4001;

// ── Shared Instances ──────────────────────────────────────

const sessionManager = new SessionManager();
const conversationHandler = new ChannelConversationHandler(sessionManager);
const conversationOperations = buildConversationOperations();

// Cache of TelegramAdapter instances per formId (to avoid re-creating on every request)
const telegramAdapters = new Map<string, TelegramAdapter>();

/**
 * Get or create a TelegramAdapter for a given form's channel connection.
 *
 * @param formId - The form ID to get the adapter for
 * @returns The TelegramAdapter and connection, or null if no connection exists
 *
 * @example
 * ```ts
 * const result = await getTelegramAdapter("form_abc");
 * if (result) {
 *   const msg = result.adapter.parseIncoming(body);
 * }
 * ```
 */
async function getTelegramAdapter(formId: string) {
  // Check cache first
  const cached = telegramAdapters.get(formId);
  if (cached) {
    return { adapter: cached };
  }

  // Look up channel connection from DB
  const connection = await getChannelConnection(formId, "telegram");
  if (!connection) {
    return null;
  }

  const config = connection.channelConfig as unknown as TelegramChannelConfig;
  const adapter = new TelegramAdapter({
    botToken: config.botToken,
    secretToken: config.secretToken,
  });

  telegramAdapters.set(formId, adapter);
  return { adapter };
}

// ── Route Handlers ──────────────────────────────────────

/**
 * Handle incoming Telegram webhook update.
 *
 * Flow:
 * 1. Look up channel connection for the form ID
 * 2. Verify webhook authenticity
 * 3. Parse incoming message
 * 4. Process through ChannelConversationHandler
 * 5. Send response back via Telegram
 */
async function handleTelegramWebhook(
  request: Request,
  formId: string,
): Promise<Response> {
  try {
    // 1. Get adapter for this form
    const result = await getTelegramAdapter(formId);
    if (!result) {
      console.error(`No Telegram channel connection found for form: ${formId}`);
      return new Response(
        JSON.stringify({ error: "Channel not configured for this form" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const { adapter } = result;

    // 2. Verify webhook
    const isValid = await adapter.verifyWebhook(request);
    if (!isValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 3. Parse incoming message
    const body = await request.json();
    const message = adapter.parseIncoming(body);

    if (!message) {
      // Not a text message — acknowledge but don't process
      return new Response("OK", { status: 200 });
    }

    console.log(
      `[telegram] Received message from ${message.senderId} for form ${formId}: "${message.text}"`,
    );

    // 4. Process through conversation handler
    const responseText = await conversationHandler.handleMessage(message, {
      formId,
      operations: conversationOperations,
    });

    // 5. Send response back
    await adapter.sendMessage(message.senderId, { text: responseText });

    console.log(
      `[telegram] Sent response to ${message.senderId}: "${responseText.substring(0, 100)}..."`,
    );

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(
      `[telegram] Error handling webhook for form ${formId}:`,
      error,
    );
    // Always return 200 to Telegram to avoid retry storms
    return new Response("OK", { status: 200 });
  }
}

/**
 * Handle webhook setup request.
 *
 * Registers the webhook URL with Telegram for a given form.
 * Body: { formId: string, webhookBaseUrl: string }
 */
async function handleTelegramSetup(request: Request): Promise<Response> {
  try {
    const { formId, webhookBaseUrl } = (await request.json()) as {
      formId: string;
      webhookBaseUrl: string;
    };

    if (!formId || !webhookBaseUrl) {
      return new Response(
        JSON.stringify({ error: "Missing formId or webhookBaseUrl" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await getTelegramAdapter(formId);
    if (!result) {
      return new Response(
        JSON.stringify({
          error: "No Telegram channel connection for this form",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const webhookUrl = `${webhookBaseUrl}/webhook/telegram/${formId}`;
    const apiResult = await result.adapter.setWebhook(webhookUrl);

    console.log(
      `[telegram] Webhook setup for form ${formId}: ${apiResult.ok ? "✓" : "✗"}`,
    );

    return new Response(JSON.stringify(apiResult), {
      status: apiResult.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[telegram] Error setting up webhook:", error);
    return new Response(JSON.stringify({ error: "Failed to setup webhook" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ── Server ──────────────────────────────────────

// Periodic session cleanup (every 30 minutes, clear sessions older than 2 hours)
const SESSION_CLEANUP_INTERVAL_MS = 30 * 60 * 1000;
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

setInterval(() => {
  const cleared = sessionManager.clearExpiredSessions(SESSION_MAX_AGE_MS);
  if (cleared > 0) {
    console.log(`[sessions] Cleared ${cleared} expired sessions`);
  }
}, SESSION_CLEANUP_INTERVAL_MS);

console.log(`Starting channels server on http://localhost:${PORT}`);

// biome-ignore lint/correctness/noUndeclaredVariables: Bun is the runtime
Bun.serve({
  port: Number(PORT),
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    // Health check
    if (pathname === "/healthcheck") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          activeSessions: sessionManager.size,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Telegram webhook: POST /webhook/telegram/:formId
    const telegramWebhookMatch = pathname.match(/^\/webhook\/telegram\/(.+)$/);
    if (req.method === "POST" && telegramWebhookMatch) {
      const formId = telegramWebhookMatch[1] ?? "";
      return handleTelegramWebhook(req, formId);
    }

    // Telegram setup: POST /setup/telegram
    if (req.method === "POST" && pathname === "/setup/telegram") {
      return handleTelegramSetup(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});
