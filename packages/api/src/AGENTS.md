<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# src

## Purpose
Source code for the API package. Contains the tRPC definitions and procedure implementations.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `router/` | tRPC routers (root and sub-routers) |
| `procedures/` | tRPC procedure builders (publicProcedure, protectedProcedure) |
| `actions/` | Server-side actions/controllers |
| `lib/` | API-specific helpers |
| `types/` | API-related type definitions |

## Key Files
| File | Description |
|------|-------------|
| `trpc.ts` | tRPC initialization and context creation |

## For AI Agents

### Working In This Directory
- **Procedures**: Define new API endpoints in `router/`.
- **Middleware**: Use `procedures/` to add middleware (auth, logging).
- **Context**: `trpc.ts` defines the context available to all procedures.

<!-- MANUAL: -->
