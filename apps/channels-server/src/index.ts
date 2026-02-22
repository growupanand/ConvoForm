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
 *   GET  /healthcheck                   — Health check
 *   POST /webhook/telegram/:botId      — Receive Telegram updates (keyed by bot ID)
 *   POST /setup/telegram               — Register webhook URL with Telegram
 *   POST /teardown/telegram            — Deregister webhook URL from Telegram
 */

import {
  ChannelConversationHandler,
  SessionManager,
  TelegramAdapter,
} from "@convoform/channels";
import { decrypt } from "@convoform/common";
import {
  type TelegramChannelConfig,
  buildConversationOperations,
  getChannelConnection,
  getChannelConnectionForTeardown,
} from "./db-operations";

const PORT = process.env.CHANNELS_SERVER_PORT ?? 4001;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? "";

// ── Shared Instances ──────────────────────────────────────

const sessionManager = new SessionManager();
const conversationHandler = new ChannelConversationHandler(sessionManager);
const conversationOperations = buildConversationOperations();

// Cache of TelegramAdapter instances per botId (channelIdentifier)
const telegramAdapters = new Map<string, TelegramAdapter>();

/**
 * Get or create a TelegramAdapter for a given bot's channel connection.
 *
 * Always checks the DB to verify the connection is enabled, even if the
 * adapter is cached. This ensures toggling `enabled` in the UI takes effect
 * immediately without requiring a server restart.
 *
 * @param botId - The channel identifier (bot ID) to get the adapter for
 * @returns The adapter and the associated formId (which may be null), or null if the connection doesn't exist or is disabled
 *
 * @example
 * ```ts
 * const result = await getTelegramAdapter("123456789");
 * if (result) {
 *   const msg = result.adapter.parseIncoming(body);
 *   console.log("Assigned form:", result.formId ?? "unassigned");
 * }
 * ```
 */
async function getTelegramAdapter(botId: string) {
  // Always verify the connection exists and is enabled in the DB
  const connection = await getChannelConnection(botId, "telegram");
  if (!connection) {
    // Connection doesn't exist or is disabled — clear any stale cache
    telegramAdapters.delete(botId);
    return null;
  }

  // Return cached adapter if available (connection is confirmed enabled above)
  const cached = telegramAdapters.get(botId);
  if (cached) {
    return { adapter: cached, formId: connection.formId };
  }

  const config = connection.channelConfig as unknown as TelegramChannelConfig;

  // Decrypt the bot token (it's encrypted in the DB by the tRPC router)
  const botToken = await decrypt(config.botToken, ENCRYPTION_KEY);

  const adapter = new TelegramAdapter({
    botToken,
    secretToken: config.secretToken,
  });

  telegramAdapters.set(botId, adapter);
  return { adapter, formId: connection.formId };
}

// ── Route Handlers ──────────────────────────────────────

/**
 * Handle incoming Telegram webhook update.
 *
 * Flow:
 * 1. Look up channel connection by bot ID
 * 2. Verify webhook authenticity
 * 3. Parse incoming message
 * 4. Check if a form is assigned — if not, send friendly message
 * 5. Process through ChannelConversationHandler
 * 6. Send response back via Telegram
 */
async function handleTelegramWebhook(
  request: Request,
  botId: string,
): Promise<Response> {
  try {
    // 1. Get adapter for this bot
    const result = await getTelegramAdapter(botId);
    if (!result) {
      console.error(`No Telegram channel connection found for bot: ${botId}`);
      return new Response(
        JSON.stringify({ error: "Channel not configured for this bot" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const { adapter, formId } = result;

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

    // 4. Check if a form is assigned
    if (!formId) {
      console.log(
        `[telegram] Bot ${botId} received message but has no form assigned — replying with notice`,
      );
      await adapter.sendMessage(message.senderId, {
        text: "This bot is not connected to any form yet. Please ask the form owner to assign a form to this bot.",
      });
      return new Response("OK", { status: 200 });
    }

    console.log(
      `[telegram] Received message from ${message.senderId} for bot ${botId} (form ${formId}): "${message.text}"`,
    );

    // 5. Process through conversation handler
    const responseText = await conversationHandler.handleMessage(message, {
      formId,
      operations: conversationOperations,
    });

    // 6. Send response back
    await adapter.sendMessage(message.senderId, { text: responseText });

    console.log(
      `[telegram] Sent response to ${message.senderId}: "${responseText.substring(0, 100)}..."`,
    );

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(`[telegram] Error handling webhook for bot ${botId}:`, error);
    // Always return 200 to Telegram to avoid retry storms
    return new Response("OK", { status: 200 });
  }
}

/**
 * Handle webhook setup request.
 *
 * Registers the webhook URL with Telegram for a given bot.
 * Body: { channelIdentifier: string, webhookBaseUrl: string }
 */
async function handleTelegramSetup(request: Request): Promise<Response> {
  try {
    const { channelIdentifier, webhookBaseUrl } = (await request.json()) as {
      channelIdentifier: string;
      webhookBaseUrl: string;
    };

    if (!channelIdentifier || !webhookBaseUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing channelIdentifier or webhookBaseUrl",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await getTelegramAdapter(channelIdentifier);
    if (!result) {
      return new Response(
        JSON.stringify({
          error: "No Telegram channel connection for this bot",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const webhookUrl = `${webhookBaseUrl}/webhook/telegram/${channelIdentifier}`;
    const apiResult = await result.adapter.setWebhook(webhookUrl);

    console.log(
      `[telegram] Webhook setup for bot ${channelIdentifier}: ${apiResult.ok ? "✓" : "✗"}`,
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

/**
 * Handle webhook teardown request.
 *
 * Deregisters the webhook from Telegram and clears the cached adapter.
 * Uses the cached adapter if available, otherwise looks up the connection
 * from the DB **regardless of enabled status** (since teardown is typically
 * called after disabling).
 *
 * Body: { channelIdentifier: string }
 */
async function handleTelegramTeardown(request: Request): Promise<Response> {
  try {
    const { channelIdentifier } = (await request.json()) as {
      channelIdentifier: string;
    };

    if (!channelIdentifier) {
      return new Response(
        JSON.stringify({ error: "Missing channelIdentifier" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Try cached adapter first (it already has the decrypted bot token)
    const cached = telegramAdapters.get(channelIdentifier);
    if (cached) {
      const apiResult = await cached.deleteWebhook();
      console.log(
        `[telegram] Webhook teardown for bot ${channelIdentifier}: ${apiResult.ok ? "✓" : "✗"} (from cache)`,
      );
    } else {
      // No cached adapter — look up connection from DB ignoring enabled flag,
      // since the connection may have just been disabled.
      const connection = await getChannelConnectionForTeardown(
        channelIdentifier,
        "telegram",
      );
      if (connection) {
        const config =
          connection.channelConfig as unknown as TelegramChannelConfig;
        const botToken = await decrypt(config.botToken, ENCRYPTION_KEY);
        const adapter = new TelegramAdapter({
          botToken,
          secretToken: config.secretToken,
        });
        const apiResult = await adapter.deleteWebhook();
        console.log(
          `[telegram] Webhook teardown for bot ${channelIdentifier}: ${apiResult.ok ? "✓" : "✗"} (from DB)`,
        );
      } else {
        console.log(
          `[telegram] No connection found for bot ${channelIdentifier}, skipping teardown`,
        );
      }
    }

    // Always clear the adapter cache for this bot
    telegramAdapters.delete(channelIdentifier);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[telegram] Error tearing down webhook:", error);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
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

    // Telegram webhook: POST /webhook/telegram/:botId
    const telegramWebhookMatch = pathname.match(/^\/webhook\/telegram\/(.+)$/);
    if (req.method === "POST" && telegramWebhookMatch) {
      const botId = telegramWebhookMatch[1] ?? "";
      return handleTelegramWebhook(req, botId);
    }

    // Telegram setup: POST /setup/telegram
    if (req.method === "POST" && pathname === "/setup/telegram") {
      return handleTelegramSetup(req);
    }

    // Telegram teardown: POST /teardown/telegram
    if (req.method === "POST" && pathname === "/teardown/telegram") {
      return handleTelegramTeardown(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});
