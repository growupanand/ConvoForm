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

`pnpm dev` sends conversation webhooks to `NEXT_PUBLIC_APP_URL` from the root `.env`, or `http://localhost:3000` when that variable is unset. `wrangler deploy` uses `https://www.convoform.com` from `wrangler.toml`.

Check the process with:

```bash
curl http://localhost:8787/healthcheck
```

## Deploy

```bash
pnpm --filter websocket-server deploy
```

Requires a logged-in Cloudflare account (`pnpm exec wrangler login` from this directory). After deploy, set `NEXT_PUBLIC_WEBSOCKET_URL` on Vercel to the `wss://` URL Wrangler prints (or a custom domain such as `wss://realtime.convoform.com`) and redeploy the web app.

A deploy drops open sockets, and `webSocketClose` is not guaranteed to run for those sockets. In-progress conversations can miss `conversation:stopped` until the next session.
