#!/usr/bin/env bun
/**
 * ============================================
 * ---- TELEGRAM ADAPTER INTEGRATION TEST -----
 * ============================================
 *
 * Tests the TelegramAdapter + ChannelConversationHandler pipeline
 * with a real Telegram bot, using long-polling (no webhook/ngrok needed).
 *
 * Uses a mock conversation flow that simulates a 3-question form.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=<your-token> bun run apps/channels-server/playground/telegram-adapter-test.ts
 */

import {
  ChannelConversationHandler,
  SessionManager,
  TelegramAdapter,
} from "@convoform/channels";
import type { ConversationOperations } from "@convoform/channels";

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ??
  "8440638155:AAF2vb94NMd-NOB-M03l5BkGokpyzkiEkpM";

if (!BOT_TOKEN) {
  console.error("\x1b[31m✗ Missing TELEGRAM_BOT_TOKEN\x1b[0m");
  process.exit(1);
}

// ── Mock form data ──────────────────────────────────

const MOCK_FORM_ID = "mock_form_001";
const QUESTIONS = [
  "👋 Welcome! What is your **name**?",
  "Great! What is your **email address**?",
  "Last one — what is your **favorite color**?",
];

// In-memory mock conversation state per sender
const mockConversations = new Map<
  string,
  { id: string; answers: string[]; questionIndex: number }
>();

/**
 * Mock ConversationOperations that simulates a simple 3-question form.
 * No database needed — everything is in memory.
 */
function buildMockOperations(): ConversationOperations {
  return {
    getConversation: async (conversationId: string) => {
      // Find the conversation in our mock store
      for (const [, conv] of mockConversations) {
        if (conv.id === conversationId) {
          const finished = conv.questionIndex >= QUESTIONS.length;
          return {
            id: conv.id,
            formId: MOCK_FORM_ID,
            name: "Mock Conversation",
            transcript: [],
            formFieldResponses: QUESTIONS.map((q, i) => ({
              id: `field_${i}`,
              fieldName: `Question ${i + 1}`,
              fieldDescription: q,
              fieldConfiguration: {
                inputType: "text" as const,
                inputConfiguration: {},
              },
              fieldValue: conv.answers[i] ?? null,
            })),
            formOverview: "A test form",
            organizationId: "org_mock",
            finishedAt: finished ? new Date() : null,
            isInProgress: !finished,
            metaData: {},
            currentFieldId: finished ? null : `field_${conv.questionIndex}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            channelType: "telegram",
            channelSenderId: null,
            form: {
              id: MOCK_FORM_ID,
              name: "Test Form",
              overview: "A test form for channel integration",
              welcomeScreenTitle: "Welcome",
              welcomeScreenMessage: "Test",
              welcomeScreenCTALabel: "Start",
              isPublished: true,
              organizationId: "org_mock",
              createdAt: new Date(),
              updatedAt: new Date(),
              showOrganizationName: false,
              showOrganizationLogo: false,
              showCustomEndScreenMessage: false,
              customEndScreenMessage: null,
            },
          } as any;
        }
      }
      throw new Error(`Conversation not found: ${conversationId}`);
    },

    createConversation: async (formId, channelInfo) => {
      const id = `conv_${Date.now()}`;
      mockConversations.set(channelInfo.channelSenderId, {
        id,
        answers: [],
        questionIndex: 0,
      });
      return {
        id,
        formId,
        name: "Mock Conversation",
        transcript: [],
        formFieldResponses: QUESTIONS.map((q, i) => ({
          id: `field_${i}`,
          fieldName: `Question ${i + 1}`,
          fieldDescription: q,
          fieldConfiguration: {
            inputType: "text" as const,
            inputConfiguration: {},
          },
          fieldValue: null,
        })),
        formOverview: "A test form",
        organizationId: "org_mock",
        finishedAt: null,
        isInProgress: true,
        metaData: {},
        currentFieldId: "field_0",
        createdAt: new Date(),
        updatedAt: new Date(),
        channelType: channelInfo.channelType,
        channelSenderId: channelInfo.channelSenderId,
        form: {
          id: MOCK_FORM_ID,
          name: "Test Form",
          overview: "A test form for channel integration",
          welcomeScreenTitle: "Welcome",
          welcomeScreenMessage: "Test",
          welcomeScreenCTALabel: "Start",
          isPublished: true,
          organizationId: "org_mock",
          createdAt: new Date(),
          updatedAt: new Date(),
          showOrganizationName: false,
          showOrganizationLogo: false,
          showCustomEndScreenMessage: false,
          customEndScreenMessage: null,
        },
      } as any;
    },

    updateConversation: async () => {
      // no-op for mock
    },
  };
}

// ── Adapter + Handler ──────────────────────────────────

const adapter = new TelegramAdapter({ botToken: BOT_TOKEN });
const sessionManager = new SessionManager();
const _handler = new ChannelConversationHandler(sessionManager);
const ops = buildMockOperations();

// Since CoreService needs AI env vars, we bypass it.
// Instead, we manually handle conversation flow here to test the adapter layer.

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
let lastUpdateId = 0;

async function sendTelegramMessage(chatId: string, text: string) {
  await adapter.sendMessage(chatId, { text });
}

async function pollAndProcess() {
  try {
    const res = await fetch(`${API_BASE}/getUpdates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offset: lastUpdateId + 1, timeout: 10 }),
    });
    const data = (await res.json()) as { ok: boolean; result: any[] };
    if (!data.ok || !Array.isArray(data.result)) return;

    for (const update of data.result) {
      lastUpdateId = update.update_id;

      // Parse through adapter
      const message = adapter.parseIncoming(update);
      if (!message) continue;

      console.log(`\x1b[36m  ↓ [${message.senderId}]:\x1b[0m ${message.text}`);

      // Handle /start command
      if (message.text === "/start") {
        // Clear any existing session
        sessionManager.deleteSession(
          "telegram",
          message.senderId,
          MOCK_FORM_ID,
        );
        mockConversations.delete(message.senderId);
        const firstQuestion = QUESTIONS[0] ?? "";
        await sendTelegramMessage(message.senderId, firstQuestion);

        // Create mock session
        const conv = await ops.createConversation(MOCK_FORM_ID, {
          channelType: "telegram",
          channelSenderId: message.senderId,
        });
        sessionManager.setSession("telegram", message.senderId, MOCK_FORM_ID, {
          conversationId: conv.id,
          currentFieldId: "field_0",
          createdAt: new Date(),
          lastAccessedAt: new Date(),
        });
        console.log("\x1b[32m  ↑ Sent first question\x1b[0m");
        continue;
      }

      // Check for active session
      const session = sessionManager.getSession(
        "telegram",
        message.senderId,
        MOCK_FORM_ID,
      );

      if (!session) {
        await sendTelegramMessage(
          message.senderId,
          "Send /start to begin filling out the form!",
        );
        continue;
      }

      // Get mock conversation and record answer
      const conv = mockConversations.get(message.senderId);
      if (!conv) continue;

      conv.answers.push(message.text);
      conv.questionIndex++;

      if (conv.questionIndex < QUESTIONS.length) {
        // Send next question
        const nextQuestion = QUESTIONS[conv.questionIndex] ?? "";
        await sendTelegramMessage(message.senderId, nextQuestion);

        // Update session
        sessionManager.setSession("telegram", message.senderId, MOCK_FORM_ID, {
          conversationId: conv.id,
          currentFieldId: `field_${conv.questionIndex}`,
          createdAt: session.createdAt,
          lastAccessedAt: new Date(),
        });
        console.log(
          `\x1b[32m  ↑ Sent question ${conv.questionIndex + 1}\x1b[0m`,
        );
      } else {
        // Form complete!
        const summary = conv.answers
          .map((a, i) => `  ${i + 1}. ${a}`)
          .join("\n");
        await sendTelegramMessage(
          message.senderId,
          `✅ Form complete! Here are your answers:\n\n${summary}\n\nSend /start to try again.`,
        );
        sessionManager.deleteSession(
          "telegram",
          message.senderId,
          MOCK_FORM_ID,
        );
        console.log("\x1b[32m  ↑ Form completed!\x1b[0m");
      }
    }
  } catch (err: any) {
    console.error("\x1b[31m  ✗ Error:\x1b[0m", err.message);
  }
}

// ── Main ──────────────────────────────────────────────

async function main() {
  const me = (await (
    await fetch(`${API_BASE}/getMe`, { method: "POST" })
  ).json()) as {
    ok: boolean;
    result: { username: string; first_name: string };
  };

  if (!me.ok) {
    console.error("\x1b[31m✗ Invalid bot token\x1b[0m");
    process.exit(1);
  }

  console.log("\x1b[1m");
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║  🧪 Telegram Adapter Integration Test    ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log("\x1b[0m");
  console.log(`  Bot: \x1b[1m@${me.result.username}\x1b[0m`);
  console.log("  Testing: TelegramAdapter + SessionManager + mock form flow");
  console.log("");
  console.log("  \x1b[2mSend /start to the bot to begin a mock form.\x1b[0m");
  console.log("  \x1b[2mPress Ctrl+C to exit.\x1b[0m");
  console.log("");

  while (true) {
    await pollAndProcess();
  }
}

main();
