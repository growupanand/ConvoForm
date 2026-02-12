<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# packages

## Purpose
This directory contains shared libraries and utilities used across the ConvoForm applications. These packages isolate functionality to promote reuse and maintainability.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ai/` | AI integration logic and prompts (see `ai/AGENTS.md`) |
| `analytics/` | Analytics providers and utilities (PostHog) (see `analytics/AGENTS.md`) |
| `api/` | tRPC router and API definition (see `api/AGENTS.md`) |
| `common/` | Shared constants and utility functions (see `common/AGENTS.md`) |
| `db/` | Database schema (Drizzle ORM) and connection logic (see `db/AGENTS.md`) |
| `e2e/` | End-to-end tests using Playwright (see `e2e/AGENTS.md`) |
| `email/` | Email templates and sending logic (see `email/AGENTS.md`) |
| `feature-flags/` | Feature flagging implementation (see `feature-flags/AGENTS.md`) |
| `file-storage/` | File storage abstraction (S3/R2) (see `file-storage/AGENTS.md`) |
| `logger/` | Logging utilities (Axiom) (see `logger/AGENTS.md`) |
| `rate-limiter/` | Rate limiting logic (Upstash) (see `rate-limiter/AGENTS.md`) |
| `react/` | React hooks and components shared logic (see `react/AGENTS.md`) |
| `release/` | Release management scripts and config (see `release/AGENTS.md`) |
| `tailwind-config/` | Shared Tailwind CSS configuration (see `tailwind-config/AGENTS.md`) |
| `tracing/` | OpenTelemetry tracing setup (see `tracing/AGENTS.md`) |
| `tsconfig/` | Shared TypeScript configurations (see `tsconfig/AGENTS.md`) |
| `ui/` | Shared UI component library (Shadcn UI based) (see `ui/AGENTS.md`) |
| `websocket-client/` | Client-side WebSocket utilities (see `websocket-client/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Packages should generally be stateless and focused on specific domains.
- Updates here often require rebuilding dependent apps.
- Use `workspace:*` for inter-package dependencies.

### Common Patterns
- Most packages export a main entry point (usually `index.ts` or `src/index.ts`).
- Types are exported to ensure type safety across the monorepo.

<!-- MANUAL: -->
