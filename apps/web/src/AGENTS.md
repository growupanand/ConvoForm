<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# src

## Purpose
Source code for the web application. Contains the Next.js App Router structure, components, hooks, and utilities.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages and layouts (see `app/AGENTS.md`) |
| `components/` | React components organized by feature (see `components/AGENTS.md`) |
| `actions/` | Server Actions for data mutation |
| `contexts/` | React Context providers |
| `hooks/` | Custom React hooks |
| `lib/` | Utility functions and libraries |
| `trpc/` | tRPC client setup |

## Key Files
| File | Description |
|------|-------------|
| `middleware.ts` | Clerk authentication middleware |
| `env.ts` | Environment variable validation |
| `instrumentation.ts` | OpenTelemetry instrumentation |

## For AI Agents

### Working In This Directory
- **App Router**: Routes are defined in `app/`. Use folders with `page.tsx` for routes.
- **Components**: specific components in `components/`, shared in `packages/ui`.
- **Data Fetching**: Use Server Actions (`actions/`) or tRPC (`trpc/`) for data interaction.

<!-- MANUAL: -->
