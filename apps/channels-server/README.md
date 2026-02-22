# channels-server

Bun HTTP server that receives webhooks from external channels (Telegram, WhatsApp, etc.) and routes them through the channel adapter → conversation handler pipeline.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/healthcheck` | Health check with active session count |
| `POST` | `/webhook/telegram/:formId` | Receive Telegram updates for a form |
| `POST` | `/setup/telegram` | Register webhook URL with Telegram |

## Architecture

```
Telegram → POST /webhook/telegram/:formId
            │
            ▼
     TelegramAdapter.verifyWebhook()
            │
            ▼
     TelegramAdapter.parseIncoming()
            │
            ▼
     ChannelConversationHandler.handleMessage()
            │
            ├── SessionManager (lookup/create session)
            ├── CoreService (AI conversation engine)
            └── Database (create/update conversation)
            │
            ▼
     TelegramAdapter.sendMessage() → Telegram Bot API
```

## Running

```bash
# Development (with hot reload)
bun run dev

# Or via turbo from the monorepo root
pnpm run dev:turbo
```

Default port: `4001` (configurable via `CHANNELS_SERVER_PORT` env var).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CHANNELS_SERVER_PORT` | No | Server port (default: `4001`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (inherited from `@convoform/db`) |

## Setup Webhook (Telegram)

To register your webhook URL with Telegram:

```bash
curl -X POST http://localhost:4001/setup/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "YOUR_FORM_ID",
    "webhookBaseUrl": "https://your-public-url.ngrok.io"
  }'
```

This tells Telegram to send updates to `https://your-public-url.ngrok.io/webhook/telegram/YOUR_FORM_ID`.

## Local Development with ngrok

```bash
# Terminal 1: Start the server
bun run dev

# Terminal 2: Expose to the internet
ngrok http 4001

# Terminal 3: Register the webhook
curl -X POST http://localhost:4001/setup/telegram \
  -H "Content-Type: application/json" \
  -d '{"formId": "YOUR_FORM_ID", "webhookBaseUrl": "https://xxxx.ngrok.io"}'
```
