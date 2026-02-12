<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# api

## Purpose
This package contains the tRPC router and API definitions for the backend. It defines the procedures that the frontend (apps/web) calls to interact with the database and other services.

## Key Files
| File | Description |
|------|-------------|
| `src/index.ts` | Entry point for the API package |
| `src/router/` | tRPC router definitions |
| `src/procedures/` | Reusable tRPC procedures (public, protected) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/actions/` | Server actions or controller logic |
| `src/lib/` | Shared libraries specific to API |
| `src/types/` | API-specific type definitions |

## For AI Agents

### Working In This Directory
- Follow tRPC patterns for defining routers and procedures.
- Use `zod` for input validation.
- Ensure proper error handling and permission checks (auth).

### Testing Requirements
- Run `bun test` for API tests.

## Dependencies

### Internal
- `@convoform/db`
- `@convoform/ai`
- `@convoform/email`
- `@convoform/file-storage`
- `@convoform/rate-limiter`

### External
- `@trpc/server`
- `@clerk/nextjs` (Auth)
- `zod`

<!-- MANUAL: -->
