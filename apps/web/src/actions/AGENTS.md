<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# actions

## Purpose
Contains Next.js Server Actions for the web application. These functions run on the server and are callable from Client Components.

## Key Files
| File | Description |
|------|-------------|
| `conversationActions.ts` | Server actions related to conversation management |
| `index.ts` | Exports actions |
| `_utils.ts` | Utility functions for actions |

## For AI Agents

### Working In This Directory
- **Server Actions**: Must be marked with `"use server"` at the top of the file (or function).
- **Validation**: Use Zod to validate inputs.
- **Auth**: Ensure proper authentication checks are performed within the action.

<!-- MANUAL: -->
