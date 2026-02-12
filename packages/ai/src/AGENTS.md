<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# src

## Purpose
Source code for the AI package. Contains the core logic for interacting with LLM providers and managing AI-driven features.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ai-actions/` | Specific AI actions (e.g., generate form, summarize) |
| `managers/` | Manager classes for orchestrating AI workflows |
| `playground/` | Experimental or testing grounds for AI features |
| `prompts/` | Prompt templates and management |
| `services/` | Service layer for external API interactions |
| `utils/` | AI-specific utilities |

## Key Files
| File | Description |
|------|-------------|
| `config.ts` | AI configuration |
| `envSchema.ts` | Environment variable validation for AI services |
| `llm-providers.ts` | Definitions and setup for different LLM providers |

## For AI Agents

### Working In This Directory
- **Providers**: Add new providers in `llm-providers.ts`.
- **Prompts**: Keep prompts in `prompts/` to separate logic from instruction.

<!-- MANUAL: -->
