/**
 * ============================================
 * ----------- CHANNEL SERVER -----------------
 * ============================================
 *
 * Runtime-agnostic HTTP handler for channel webhooks.
 *
 * Uses the standard Web `Request` / `Response` API, making it
 * compatible with any runtime:
 *
 * - **Bun**: `Bun.serve({ fetch: server.handleRequest })`
 * - **Vercel**: `export default server.handleRequest` (or wrap in Next.js route)
 * - **Cloudflare Workers**: `export default { fetch: server.handleRequest }`
 *
 * All business logic (webhook routing, adapter management,
 * conversation handling) lives here. Runtime-specific apps
 * are thin wrappers.
 */

import { decrypt } from "@convoform/common";
import { TelegramAdapter } from "../adapters/telegram-adapter";
import { ChannelConversationHandler } from "../channel-conversation-handler";
import type { SessionManager } from "../session-manager";
import type {
  ChannelServerOperations,
  TelegramChannelConfig,
} from "./operations";

/**
 * Configuration for creating a ChannelServer.
 *
 * @example
 * ```ts
 * const config: ChannelServerConfig = {
 *   sessionManager: new InMemorySessionManager(),
 *   encryptionKey: process.env.ENCRYPTION_KEY ?? "",
 *   operations: buildChannelServerOperations(),
 * };
 * ```
 */
export interface ChannelServerConfig {
  /** Session manager implementation (in-memory or DB-backed) */
  sessionManager: SessionManager;
  /** Encryption key for decrypting stored bot tokens */
  encryptionKey: string;
  /** Database operations for conversations and channel connections */
  operations: ChannelServerOperations;
}

/**
 * Runtime-agnostic channel server.
 *
 * Routes incoming HTTP requests to the appropriate channel handler
 * (Telegram webhook, setup, teardown, health check) and returns
 * standard Web `Response` objects.
 *
 * @example
 * ```ts
 * // Bun persistent server
 * const server = new ChannelServer({
 *   sessionManager: new InMemorySessionManager(),
 *   encryptionKey: process.env.ENCRYPTION_KEY ?? "",
 *   operations: buildChannelServerOperations(),
 * });
 * Bun.serve({ port: 4001, fetch: (req) => server.handleRequest(req) });
 *
 * // Vercel serverless (Next.js API route)
 * export async function POST(req: Request) {
 *   return server.handleRequest(req);
 * }
 * ```
 */
export class ChannelServer {
  private sessionManager: SessionManager;
  private encryptionKey: string;
  private operations: ChannelServerOperations;
  private conversationHandler: ChannelConversationHandler;

  /** Cache of TelegramAdapter instances per botId (channelIdentifier) */
  private telegramAdapters = new Map<string, TelegramAdapter>();

  constructor(config: ChannelServerConfig) {
    this.sessionManager = config.sessionManager;
    this.encryptionKey = config.encryptionKey;
    this.operations = config.operations;
    this.conversationHandler = new ChannelConversationHandler(
      this.sessionManager,
    );
  }

  /**
   * Get the session manager instance.
   * Useful for runtime-specific operations like periodic cleanup.
   *
   * @returns The session manager used by this server
   *
   * @example
   * ```ts
   * const sm = server.getSessionManager();
   * if (sm instanceof InMemorySessionManager) {
   *   sm.clearExpiredSessions(2 * 60 * 60 * 1000);
   * }
   * ```
   */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  /**
   * Main entry point — route an incoming HTTP request to the
   * appropriate handler and return a Response.
   *
   * Routes:
   * - `GET  /healthcheck`              → Health check
   * - `POST /webhook/telegram/:botId`  → Telegram webhook
   * - `POST /setup/telegram`           → Register Telegram webhook
   * - `POST /teardown/telegram`        → Deregister Telegram webhook
   *
   * @param req - The incoming HTTP request (standard Web API)
   * @returns The HTTP response
   *
   * @example
   * ```ts
   * // Works with any runtime that uses standard Request/Response
   * const response = await server.handleRequest(request);
   * ```
   */
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    // Health check
    if (pathname === "/healthcheck") {
      return this.handleHealthCheck();
    }

    // Telegram webhook: POST /webhook/telegram/:botId
    const telegramWebhookMatch = pathname.match(/^\/webhook\/telegram\/(.+)$/);
    if (req.method === "POST" && telegramWebhookMatch) {
      const botId = telegramWebhookMatch[1] ?? "";
      return this.handleTelegramWebhook(req, botId);
    }

    // Telegram setup: POST /setup/telegram
    if (req.method === "POST" && pathname === "/setup/telegram") {
      return this.handleTelegramSetup(req);
    }

    // Telegram teardown: POST /teardown/telegram
    if (req.method === "POST" && pathname === "/teardown/telegram") {
      return this.handleTelegramTeardown(req);
    }

    return new Response("Not Found", { status: 404 });
  }

  // ── Private Handlers ──────────────────────────────────────

  private handleHealthCheck(): Response {
    return new Response(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  /**
   * Get or create a TelegramAdapter for a given bot's channel connection.
   *
   * Always checks the DB to verify the connection is enabled, even if the
   * adapter is cached. This ensures toggling `enabled` in the UI takes effect
   * immediately without requiring a server restart.
   */
  private async getTelegramAdapter(botId: string) {
    const connection = await this.operations.getChannelConnection(
      botId,
      "telegram",
    );
    if (!connection) {
      this.telegramAdapters.delete(botId);
      return null;
    }

    const cached = this.telegramAdapters.get(botId);
    if (cached) {
      return { adapter: cached, formId: connection.formId };
    }

    const config = connection.channelConfig as unknown as TelegramChannelConfig;
    const botToken = await decrypt(config.botToken, this.encryptionKey);

    const adapter = new TelegramAdapter({
      botToken,
      secretToken: config.secretToken,
    });

    this.telegramAdapters.set(botId, adapter);
    return { adapter, formId: connection.formId };
  }

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
  private async handleTelegramWebhook(
    request: Request,
    botId: string,
  ): Promise<Response> {
    try {
      const result = await this.getTelegramAdapter(botId);
      if (!result) {
        console.error(`No Telegram channel connection found for bot: ${botId}`);
        return new Response(
          JSON.stringify({ error: "Channel not configured for this bot" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const { adapter, formId } = result;

      const isValid = await adapter.verifyWebhook(request);
      if (!isValid) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json();
      const message = adapter.parseIncoming(body);

      if (!message) {
        return new Response("OK", { status: 200 });
      }

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

      const responseText = await this.conversationHandler.handleMessage(
        message,
        {
          formId,
          operations: this.operations,
        },
      );

      await adapter.sendMessage(message.senderId, { text: responseText });

      console.log(
        `[telegram] Sent response to ${message.senderId}: "${responseText.substring(0, 100)}..."`,
      );

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error(
        `[telegram] Error handling webhook for bot ${botId}:`,
        error,
      );
      return new Response("OK", { status: 200 });
    }
  }

  /**
   * Handle webhook setup request.
   * Registers the webhook URL with Telegram for a given bot.
   *
   * Body: { channelIdentifier: string, webhookBaseUrl: string }
   */
  private async handleTelegramSetup(request: Request): Promise<Response> {
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

      const result = await this.getTelegramAdapter(channelIdentifier);
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
      return new Response(
        JSON.stringify({ error: "Failed to setup webhook" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  /**
   * Handle webhook teardown request.
   * Deregisters the webhook from Telegram and clears the cached adapter.
   *
   * Body: { channelIdentifier: string }
   */
  private async handleTelegramTeardown(request: Request): Promise<Response> {
    try {
      const { channelIdentifier } = (await request.json()) as {
        channelIdentifier: string;
      };

      if (!channelIdentifier) {
        return new Response(
          JSON.stringify({ error: "Missing channelIdentifier" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const cached = this.telegramAdapters.get(channelIdentifier);
      if (cached) {
        const apiResult = await cached.deleteWebhook();
        console.log(
          `[telegram] Webhook teardown for bot ${channelIdentifier}: ${apiResult.ok ? "✓" : "✗"} (from cache)`,
        );
      } else {
        const connection =
          await this.operations.getChannelConnectionForTeardown(
            channelIdentifier,
            "telegram",
          );
        if (connection) {
          const config =
            connection.channelConfig as unknown as TelegramChannelConfig;
          const botToken = await decrypt(config.botToken, this.encryptionKey);
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

      this.telegramAdapters.delete(channelIdentifier);

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
}
