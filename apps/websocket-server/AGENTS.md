<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# websocket-server

## Purpose
A standalone WebSocket server (built with Bun) that handles real-time communication for form sessions. It manages rooms for forms and conversations.

## Key Files
| File | Description |
|------|-------------|
| `src/index.ts` | Server entry point and WebSocket handler |
| `src/controller.ts` | Business logic for socket events |
| `src/utils/socket.utils.ts` | Helper functions for room management |

## For AI Agents

### Working In This Directory
- This app runs on Bun.
- It handles events like `join-room-form`, `conversation:started`, etc.
- Updates here need to be coordinated with `apps/web` and `packages/websocket-client`.

## Dependencies

### External
- `bun` (Runtime)

<!-- MANUAL: -->
