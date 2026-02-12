<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# api

## Purpose
Next.js API Route Handlers. These provide backend endpoints for webhooks, custom integrations, and specific app functionality that doesn't fit into tRPC.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `auth/` | Auth callbacks (e.g. Google OAuth) |
| `conversation/` | Conversation handling endpoints |
| `form/` | Form related endpoints |
| `healthcheck/` | Health check endpoint |
| `ingest/` | Data ingestion (e.g. traces) |
| `og/` | Open Graph image generation |
| `playground/` | API playground endpoints |
| `trpc/` | The tRPC API endpoint |
| `webhook/` | Webhook receivers (Stripe, Clerk, etc.) |

## Key Files
| File | Description |
|------|-------------|
| `_utils.ts` | Shared utilities for API routes |

## For AI Agents

### Working In This Directory
- **Request/Response**: Uses standard `Request` and `Response` objects.
- **Edge**: Check if routes are configured for Edge runtime.

<!-- MANUAL: -->
