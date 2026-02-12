<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# rate-limiter

## Purpose
Implements rate limiting using Upstash Redis. It protects the API from abuse.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Entry point |
| `package.json` | Dependencies |

## For AI Agents

### Working In This Directory
- Use the rate limiter in API routes or TRPC procedures.
- Configure limits based on the sensitivity/cost of the operation.

## Dependencies

### External
- `@upstash/ratelimit`
- `@upstash/redis`

<!-- MANUAL: -->
