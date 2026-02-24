#!/usr/bin/env bun
/**
 * ============================================
 * -------- TELEGRAM BOT PLAYGROUND ----------
 * ============================================
 *
 * A standalone CLI to test Telegram Bot API messaging.
 * Uses long-polling (getUpdates) — no webhook or public URL needed.
 *
 * Usage:
 *   1. Create a bot via @BotFather on Telegram and get a token
 *   2. Run: TELEGRAM_BOT_TOKEN=<your-token> bun run playground/telegram-playground.ts
 *   3. Send a message to your bot on Telegram → see it in terminal
 *   4. Type a message in terminal + Enter → bot sends it to the last chat
 *
 * Commands:
 *   /to <chat_id>   — Switch the active chat to a specific chat ID
 *   /quit           — Exit the playground
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error(
    "\x1b[31m✗ Missing TELEGRAM_BOT_TOKEN environment variable.\x1b[0m",
  );
  console.error(
    "  Run: TELEGRAM_BOT_TOKEN=<your-token> bun run playground/telegram-playground.ts",
  );
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ── State ──────────────────────────────────────────────
let activeChatId: number | null = null;
let lastUpdateId = 0;
let isRunning = true;

// ── Telegram API Helpers ──────────────────────────────────

/**
 * Call a Telegram Bot API method.
 *
 * @example
 * ```ts
 * const me = await callTelegramApi("getMe");
 * console.log(me.result.username);
 * ```
 */
async function callTelegramApi(
  method: string,
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; result: any }> {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

/**
 * Send a text message to a chat.
 *
 * @example
 * ```ts
 * await sendMessage(123456789, "Hello from the playground!");
 * ```
 */
async function sendMessage(chatId: number, text: string): Promise<void> {
  const res = await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
  });
  if (res.ok) {
    console.log(`\x1b[32m  ↑ Sent to ${chatId}\x1b[0m`);
  } else {
    console.error("\x1b[31m  ✗ Failed to send:\x1b[0m", res);
  }
}

/**
 * Long-poll for new updates from Telegram.
 */
async function pollUpdates(): Promise<void> {
  try {
    const res = await callTelegramApi("getUpdates", {
      offset: lastUpdateId + 1,
      timeout: 10, // long-poll for 10 seconds
    });

    if (!res.ok || !Array.isArray(res.result)) return;

    for (const update of res.result) {
      lastUpdateId = update.update_id;
      const msg = update.message;
      if (!msg?.text) continue;

      const chatId = msg.chat.id;
      const from = msg.from?.first_name ?? "Unknown";
      const username = msg.from?.username ? `@${msg.from.username}` : "";

      // Auto-set active chat to the latest incoming message
      activeChatId = chatId;

      console.log(
        `\x1b[36m  ↓ [${from} ${username}] (chat: ${chatId}):\x1b[0m ${msg.text}`,
      );
    }
  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.error("\x1b[31m  ✗ Poll error:\x1b[0m", err.message);
    }
  }
}

// ── CLI Input Handler ─────────────────────────────────

/**
 * Read lines from stdin and send them as messages.
 */
async function handleStdinInput(): Promise<void> {
  // biome-ignore lint/correctness/noUndeclaredVariables: Bun is the runtime
  const reader = Bun.stdin.stream().getReader();
  const decoder = new TextDecoder();

  while (isRunning) {
    const { value, done } = await reader.read();
    if (done) break;

    const input = decoder.decode(value).trim();
    if (!input) continue;

    // Handle special commands
    if (input === "/quit") {
      console.log("\x1b[33m  Bye! 👋\x1b[0m");
      isRunning = false;
      process.exit(0);
    }

    if (input.startsWith("/to ")) {
      const newChatId = Number.parseInt(input.split(" ")[1] ?? "", 10);
      if (Number.isNaN(newChatId)) {
        console.error("\x1b[31m  ✗ Invalid chat ID\x1b[0m");
      } else {
        activeChatId = newChatId;
        console.log(`\x1b[33m  → Active chat set to ${activeChatId}\x1b[0m`);
      }
      continue;
    }

    // Send message to active chat
    if (!activeChatId) {
      console.error(
        "\x1b[31m  ✗ No active chat. Send a message to the bot on Telegram first, or use /to <chat_id>\x1b[0m",
      );
      continue;
    }

    await sendMessage(activeChatId, input);
  }
}

// ── Main ──────────────────────────────────────────────

async function main(): Promise<void> {
  // Verify bot token
  const me = await callTelegramApi("getMe");
  if (!me.ok) {
    console.error("\x1b[31m✗ Invalid bot token.\x1b[0m", me);
    process.exit(1);
  }

  console.log("\x1b[1m");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║     🤖 Telegram Bot Playground       ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("\x1b[0m");
  console.log(
    `  Bot: \x1b[1m@${me.result.username}\x1b[0m (${me.result.first_name})`,
  );
  console.log("");
  console.log("  \x1b[2mSend a message to your bot on Telegram to start.");
  console.log("  Type here and press Enter to reply.");
  console.log("  Commands: /to <chat_id> | /quit\x1b[0m");
  console.log("");

  // Start polling loop in background
  (async () => {
    while (isRunning) {
      await pollUpdates();
    }
  })();

  // Handle stdin input
  await handleStdinInput();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
