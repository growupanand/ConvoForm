# channels-server

Bun runtime wrapper for the `ChannelServer` from `@convoform/channels`. Receives webhooks from external channels (Telegram, WhatsApp, etc.) and routes them through the channel adapter → conversation handler pipeline.

> **Note:** All business logic lives in `@convoform/channels`. This app is a thin Bun bootstrap (~50 lines) that adds in-memory session management and periodic cleanup.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/healthcheck` | Health check |
| `POST` | `/webhook/telegram/:botId` | Receive Telegram updates (keyed by bot ID) |
| `POST` | `/setup/telegram` | Register webhook URL with Telegram |
| `POST` | `/teardown/telegram` | Deregister webhook URL from Telegram |

## Architecture

```
Telegram → POST /webhook/telegram/:botId
            │
            ▼
     ChannelServer.handleRequest()  ← from @convoform/channels
            │
            ├── getTelegramAdapter()  (DB lookup + decrypt + cache)
            ├── TelegramAdapter.verifyWebhook()
            ├── TelegramAdapter.parseIncoming()
            ├── ChannelConversationHandler.handleMessage()
            │   ├── SessionManager (InMemorySessionManager for Bun)
            │   ├── CoreService (AI conversation engine)
            │   └── Database (create/update conversation)
            └── TelegramAdapter.sendMessage() → Telegram Bot API
```

## Running

```bash
# Development (with hot reload)
bun run dev

# Or via turbo from the monorepo root
pnpm run dev:turbo --filter channels-server
```

Default port: `4001` (configurable via `CHANNELS_SERVER_PORT` env var).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CHANNELS_SERVER_PORT` | No | Server port (default: `4001`) |
| `ENCRYPTION_KEY` | Yes | Key for decrypting stored bot tokens |
| `DATABASE_URL` | Yes | PostgreSQL connection string (inherited from `@convoform/db`) |

## Deploying on Other Runtimes

This app uses `InMemorySessionManager` with `Bun.serve()`. To deploy on a different runtime (e.g., Vercel serverless), create a new app that uses `DbSessionManager` instead:

```ts
import { ChannelServer, DbSessionManager, buildChannelServerOperations } from "@convoform/channels";

const server = new ChannelServer({
  sessionManager: new DbSessionManager(),
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  operations: buildChannelServerOperations(),
});

// Vercel / Next.js API route
export async function POST(req: Request) {
  return server.handleRequest(req);
}
```

See `packages/channels/README.md` for more details on the runtime-agnostic architecture.

## Local Development with ngrok

```bash
# Terminal 1: Start the server
bun run dev

# Terminal 2: Expose to the internet
ngrok http 4001

# Terminal 3: Register the webhook
curl -X POST http://localhost:4001/setup/telegram \
  -H "Content-Type: application/json" \
  -d '{"channelIdentifier": "YOUR_BOT_ID", "webhookBaseUrl": "https://xxxx.ngrok.io"}'
```
