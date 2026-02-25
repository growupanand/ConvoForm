#!/usr/bin/env bun
/**
 * ============================================
 * -------- E2E SETUP FOR TELEGRAM BOT --------
 * ============================================
 *
 * Sets up everything needed for full end-to-end testing:
 * 1. Pushes the channel connection table to DB (if not exists)
 * 2. Lists available forms
 * 3. Creates a ChannelConnection record linking a form to the bot
 *
 * Usage:
 *   bun run apps/channels-server/playground/e2e-setup.ts
 */

import { db, eq } from "@convoform/db";
import { channelConnection, form } from "@convoform/db/src/schema";

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ??
  "8440638155:AAF2vb94NMd-NOB-M03l5BkGokpyzkiEkpM";
const SECRET_TOKEN = "convoform-telegram-test";

async function main() {
  console.log("\x1b[1m");
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║     🔧 Telegram E2E Setup                ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log("\x1b[0m");

  // 1. List available published forms
  console.log("\x1b[33m  Step 1: Fetching published forms...\x1b[0m\n");

  const forms = await db.query.form.findMany({
    where: eq(form.isPublished, true),
    columns: {
      id: true,
      name: true,
      overview: true,
      organizationId: true,
    },
    with: {
      formFields: {
        columns: {
          id: true,
          fieldName: true,
        },
      },
    },
    limit: 10,
  });

  if (forms.length === 0) {
    console.error(
      "\x1b[31m  ✗ No published forms found. Create and publish a form first.\x1b[0m",
    );
    process.exit(1);
  }

  console.log("  Available forms:\n");
  for (const [i, f] of forms.entries()) {
    console.log(
      `    \x1b[1m${i + 1}.\x1b[0m ${f.name} \x1b[2m(${f.id})\x1b[0m`,
    );
    console.log(
      `       Fields: ${f.formFields.map((ff) => ff.fieldName).join(", ")}`,
    );
    console.log(`       Org: ${f.organizationId}`);
    console.log("");
  }

  // 2. Prompt for form selection
  process.stdout.write("  Select form number (or press Enter for #1): ");
  let selected = 0;

  for await (const line of console) {
    const trimmed = (line as string).trim();
    if (!trimmed) {
      selected = 0;
      break;
    }
    selected = Number.parseInt(trimmed, 10) - 1;
    if (Number.isNaN(selected) || selected < 0 || selected >= forms.length) {
      console.error("\x1b[31m  ✗ Invalid selection\x1b[0m");
      process.exit(1);
    }
    break;
  }

  const selectedForm = forms[selected];
  console.log(
    `\n  \x1b[32m✓ Selected:\x1b[0m ${selectedForm.name} (${selectedForm.id})\n`,
  );

  // 3. Check if channel connection already exists
  console.log("\x1b[33m  Step 2: Setting up channel connection...\x1b[0m\n");

  const existing = await db.query.channelConnection.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.formId, selectedForm.id), eq(table.channelType, "telegram")),
  });

  if (existing) {
    console.log(
      `  \x1b[33m⚠ Channel connection already exists (${existing.id}). Updating...\x1b[0m`,
    );
    await db
      .update(channelConnection)
      .set({
        channelConfig: {
          botToken: BOT_TOKEN,
          secretToken: SECRET_TOKEN,
        },
        enabled: true,
      })
      .where(eq(channelConnection.id, existing.id));
    console.log("  \x1b[32m✓ Updated existing channel connection\x1b[0m\n");
  } else {
    const [created] = await db
      .insert(channelConnection)
      .values({
        formId: selectedForm.id,
        channelType: "telegram",
        channelConfig: {
          botToken: BOT_TOKEN,
          secretToken: SECRET_TOKEN,
        },
        enabled: true,
        organizationId: selectedForm.organizationId,
      })
      .returning();
    console.log(
      `  \x1b[32m✓ Created channel connection: ${created?.id}\x1b[0m\n`,
    );
  }

  // 4. Summary
  console.log("  \x1b[1m── Next Steps ──\x1b[0m\n");
  console.log("  1. Start the channels server:");
  console.log(
    "     \x1b[36mdotenv -e .env -- bun run apps/channels-server/src/index.ts\x1b[0m\n",
  );
  console.log("  2. In another terminal, start ngrok:");
  console.log("     \x1b[36mngrok http 4001\x1b[0m\n");
  console.log(
    "  3. Register the webhook (replace <NGROK_URL> with your ngrok URL):",
  );
  console.log(
    "     \x1b[36mcurl -X POST http://localhost:4001/setup/telegram \\",
  );
  console.log(`       -H "Content-Type: application/json" \\`);
  console.log(
    `       -d '{"formId":"${selectedForm.id}","webhookBaseUrl":"<NGROK_URL>"}'\x1b[0m\n`,
  );
  console.log(
    "  4. Send a message to your bot on Telegram and watch the magic! 🎉\n",
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
