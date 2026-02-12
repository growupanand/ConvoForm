<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# ai

## Purpose
This package contains the AI integration logic for ConvoForm, leveraging Vercel AI SDK to interact with various LLM providers (OpenAI, Groq, Ollama). It handles prompt management and AI-driven features.

## Key Files
| File | Description |
|------|-------------|
| `src/index.ts` | Main entry point exporting AI services |
| `package.json` | Dependencies including @ai-sdk/openai, @ai-sdk/groq |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/ai-actions/` | specific ai actions |
| `src/managers/` | manager logic |
| `src/prompts/` | Prompt templates and engineering |
| `src/services/` | Service layer for AI interactions |
| `src/utils/` | Utility functions for AI processing |

## For AI Agents

### Working In This Directory
- Use the Vercel AI SDK patterns.
- Ensure prompts are well-structured and tested.
- AI logic should be agnostic of the specific provider where possible, or handle provider-specifics gracefully.

### Testing Requirements
- Run `bun test ./**/*.ai.test.ts` for AI-specific tests.

## Dependencies

### Internal
- `@convoform/analytics`
- `@convoform/db`
- `@convoform/logger`
- `@convoform/tracing`

### External
- `ai` (Vercel AI SDK)
- `zod` for schema validation

<!-- MANUAL: -->
