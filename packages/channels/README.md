# @convoform/channels

Core abstractions and adapters for multi-channel input support (Telegram, WhatsApp, SMS, etc.).

## Architecture

```
src/
├── channel.ts                      # ChannelAdapter abstract class, ChannelMessage, ChannelResponse types
├── session-manager.ts              # In-memory session tracking (sender → active conversation)
├── channel-conversation-handler.ts # Bridge between channel adapters and CoreService (AI engine)
├── adapters/
│   ├── telegram-adapter.ts         # Telegram Bot API adapter
│   └── telegram-types.ts           # Telegram API type definitions
└── index.ts                        # Barrel exports
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **ChannelAdapter** | Abstract class each channel implements — `parseIncoming()`, `sendMessage()`, `verifyWebhook()` |
| **SessionManager** | Maps `{channelType, senderId, formId}` → active conversation. Needed because channel users have no client-side state |
| **ChannelConversationHandler** | Consumes AI streams server-side and returns plain text (channels don't support streaming) |

## Usage

```ts
import {
  ChannelConversationHandler,
  SessionManager,
  TelegramAdapter,
} from "@convoform/channels";

// 1. Create instances
const sessionManager = new SessionManager();
const handler = new ChannelConversationHandler(sessionManager);
const adapter = new TelegramAdapter({
  botToken: "123456:ABC-DEF...",
  secretToken: "my-secret",
});

// 2. Parse incoming webhook
const message = adapter.parseIncoming(webhookBody);

// 3. Process through conversation engine
if (message) {
  const responseText = await handler.handleMessage(message, {
    formId: "form_abc",
    operations: conversationOperations,
  });

  // 4. Send response back
  await adapter.sendMessage(message.senderId, { text: responseText });
}
```

## Adding a New Channel

1. Create `src/adapters/your-channel-adapter.ts` extending `ChannelAdapter`
2. Implement `parseIncoming()`, `sendMessage()`, and `verifyWebhook()`
3. Export from `src/index.ts`
4. Add webhook route in `apps/channels-server`

## Tests

```bash
bun test
```

Tests cover `SessionManager`, `TelegramAdapter.parseIncoming()`, and `ChannelConversationHandler` (using `MockLanguageModelV2`).
