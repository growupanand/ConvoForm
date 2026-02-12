<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# schema

## Purpose
Defines the database schema using Drizzle ORM. Tables are organized by domain.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Exports all schema definitions |
| `base.ts` | Base schema fields or types |
| `lib.ts` | Shared schema utilities |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `conversations/` | Conversation-related tables |
| `fileUploads/` | File upload tracking tables |
| `formDesigns/` | Form styling tables |
| `formFields/` | Form field definition tables |
| `forms/` | Main form tables |
| `google/` | Google integration tables |
| `organizationMembers/` | Organization membership tables |
| `organizations/` | Organization tables |
| `users/` | User tables |

## For AI Agents

### Working In This Directory
- **Tables**: Define tables in their respective subdirectories.
- **Export**: Ensure new tables are exported in `index.ts`.

<!-- MANUAL: -->
