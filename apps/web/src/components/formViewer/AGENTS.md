<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# formViewer

## Purpose
Components responsible for rendering the form to the end-user. This is the core "runtime" of the conversational form.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `DynamicAnswerInput/` | Components for different input types (text, choice, etc.) |

## Key Files
| File | Description |
|------|-------------|
| `index.tsx` | Main form viewer component |

## For AI Agents

### Working In This Directory
- **State**: Heavily relies on local state or context to track conversation progress.
- **Animations**: Uses Framer Motion for chat bubble animations.
- **Inputs**: Must handle various field types defined in the schema.

<!-- MANUAL: -->
