<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# apps

## Purpose
This directory contains the main applications that make up the ConvoForm platform. It follows a monorepo structure where each application is a separate workspace.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `web/` | The main Next.js web application (dashboard, form builder, form renderer) (see `web/AGENTS.md`) |
| `docs/` | Documentation site powered by Nextra (see `docs/AGENTS.md`) |
| `websocket-server/` | WebSocket server for real-time form interactions (see `websocket-server/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Each subdirectory is a standalone application with its own `package.json`.
- Dependencies between apps and packages are managed via workspace protocols.

### Testing Requirements
- Run tests within specific app directories or via root `turbo` commands.

<!-- MANUAL: -->
