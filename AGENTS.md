<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# ConvoForm

## Purpose
ConvoForm is an open-source, AI-powered conversational form builder. It allows users to create forms that feel like conversations, enhancing user engagement and data collection. This is a monorepo managed with TurboRepo and pnpm.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Root configuration, scripts, and devDependencies |
| `pnpm-workspace.yaml` | Defines the workspace structure (apps/*, packages/*) |
| `turbo.json` | TurboRepo pipeline configuration |
| `docker-compose.yml` | Docker services orchestration |
| `README.md` | Project overview and setup instructions |
| `biome.json` | Biome configuration for formatting and linting |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `apps/` | Application entry points (web, docs, websocket-server) (see `apps/AGENTS.md`) |
| `packages/` | Shared internal libraries and utilities (see `packages/AGENTS.md`) |
| `docker/` | Containerization configurations (see `docker/AGENTS.md`) |
| `skills/` | Custom agent skills |

## For AI Agents

### Working In This Directory
- **Package Manager**: Use `pnpm` for all dependency management.
- **Monorepo Tool**: Use `turbo` for running tasks across the workspace.
- **Formatting/Linting**: Use `biome` (via `pnpm format` or `pnpm lint`).
- **State**: Check `git status` before making changes.

### Testing Requirements
- Run `pnpm test` to execute tests across the workspace.
- Run `pnpm e2e` for end-to-end testing (Playwright).

### Common Patterns
- **Workspace Dependencies**: Internal packages are referenced with `workspace:*`.
- **Strict Environment**: `.env` files are required for many tasks (use `dotenv-cli`).

## Dependencies

### External
- **TurboRepo**: Build system
- **Biome**: Toolchain for formatting and linting
- **Release-it**: Release automation
- **Husky**: Git hooks

<!-- MANUAL: Custom project notes can be added below -->
