# websocket-server

Realtime server for ConvoForm. It runs as a Cloudflare Worker with one SQLite-backed Durable Object (`RealtimeHub`) and the WebSocket Hibernation API. The wire protocol matches the previous server, so the web client only needs a new URL.

## Local development

From the repo root:

```bash
pnpm dev
```

Wrangler listens on `http://localhost:8787`. Point the web app at it:

```bash
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:8787"
```

`pnpm dev` sends conversation webhooks to `NEXT_PUBLIC_APP_URL` from the root `.env`, or `http://localhost:3000` when that variable is unset. It also passes `INTERNAL_EMAIL_API_SECRET` so the `WebhookDeliveryWorkflow` can sign internal requests. `wrangler deploy` uses `https://www.convoform.com` from `wrangler.toml`.

Check the process with:

```bash
curl http://localhost:8787/healthcheck
```

## Webhook delivery workflow

`WebhookDeliveryWorkflow` delivers `response.completed` webhooks with durable retries (1 initial attempt + 7 retries, exponential backoff from 1 minute). The web app starts an instance over the Cloudflare REST API when `CF_ACCOUNT_ID`, `CF_API_TOKEN` and `CF_WEBHOOK_WORKFLOW_NAME=convoform-webhook-delivery` are set. Without those variables the app falls back to the best-effort direct adapter.

The Worker only calls the main app's signed internal routes. It never connects to the database and never holds endpoint secrets.

## Deploy

```bash
pnpm --filter websocket-server deploy
```

Requires a logged-in Cloudflare account (`pnpm exec wrangler login` from this directory).

Set the internal signing secret once per environment:

```bash
pnpm exec wrangler secret put INTERNAL_EMAIL_API_SECRET
```

Then set the following on Vercel/your web host:

- `CF_ACCOUNT_ID` — the Cloudflare account id that owns the Worker.
- `CF_API_TOKEN` — a token with `Workers Scripts Write`.
- `CF_WEBHOOK_WORKFLOW_NAME` — `convoform-webhook-delivery` (must match `wrangler.toml`).

After deploy, set `NEXT_PUBLIC_WEBSOCKET_URL` on Vercel to the `wss://` URL Wrangler prints (or a custom domain such as `wss://realtime.convoform.com`) and redeploy the web app.

A deploy drops open sockets, and `webSocketClose` is not guaranteed to run for those sockets. In-progress conversations can miss `conversation:stopped` until the next session.
