# @convoform/channels

Core abstractions, adapters, and runtime-agnostic server for multi-channel input support (Telegram, WhatsApp, SMS, etc.).

## Architecture

```
src/
├── channel.ts                         # ChannelAdapter abstract class, ChannelMessage, ChannelResponse types
├── session-manager.ts                 # SessionManager interface + InMemorySessionManager
├── db-session-manager.ts              # DbSessionManager (DB-backed, for serverless)
├── channel-conversation-handler.ts    # Bridge between channel adapters and CoreService (AI engine)
├── adapters/
│   ├── telegram-adapter.ts            # Telegram Bot API adapter
│   └── telegram-types.ts             # Telegram API type definitions
├── server/
│   ├── channel-server.ts              # Runtime-agnostic ChannelServer with handleRequest()
│   └── operations.ts                  # ChannelServerOperations interface + default DB implementation
└── index.ts                           # Barrel exports
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **ChannelAdapter** | Abstract class each channel implements — `parseIncoming()`, `sendMessage()`, `verifyWebhook()` |
| **SessionManager** | Interface for tracking `{channelType, senderId, formId}` → active conversation |
| **InMemorySessionManager** | Map-based implementation for persistent servers (Bun, Node.js) |
| **DbSessionManager** | DB-backed implementation for serverless (Vercel, Cloudflare Workers) — no new tables needed |
| **ChannelServer** | Runtime-agnostic HTTP handler — routes webhooks, manages adapters, delegates to `ChannelConversationHandler` |
| **ChannelConversationHandler** | Consumes AI streams server-side and returns plain text (channels don't support streaming) |
| **ChannelServerOperations** | Injectable DB operations for conversations and channel connections |

## Usage

### Bun persistent server

```ts
import {
  ChannelServer,
  InMemorySessionManager,
  buildChannelServerOperations,
} from "@convoform/channels";

const sessionManager = new InMemorySessionManager();
const server = new ChannelServer({
  sessionManager,
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  operations: buildChannelServerOperations(),
});

Bun.serve({
  port: 4001,
  fetch: (req) => server.handleRequest(req),
});

// Optional: periodic session cleanup (Bun-only)
setInterval(() => {
  sessionManager.clearExpiredSessions(2 * 60 * 60 * 1000);
}, 30 * 60 * 1000);
```

### Vercel serverless (Next.js API route)

```ts
import {
  ChannelServer,
  DbSessionManager,
  buildChannelServerOperations,
} from "@convoform/channels";

const server = new ChannelServer({
  sessionManager: new DbSessionManager(),
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  operations: buildChannelServerOperations(),
});

export async function POST(req: Request) {
  return server.handleRequest(req);
}

export async function GET(req: Request) {
  return server.handleRequest(req);
}
```

## Adding a New Channel

1. Create `src/adapters/your-channel-adapter.ts` extending `ChannelAdapter`
2. Implement `parseIncoming()`, `sendMessage()`, and `verifyWebhook()`
3. Export from `src/index.ts`
4. Add webhook route handling in `ChannelServer`

## Tests

```bash
bun test
```

Tests cover `InMemorySessionManager`, `TelegramAdapter`, and `ChannelConversationHandler` (using `MockLanguageModelV2`).
