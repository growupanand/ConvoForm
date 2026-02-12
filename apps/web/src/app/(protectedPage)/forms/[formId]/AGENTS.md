<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# [formId]

## Purpose
The form editor and management hub. This is where the user designs the form, views responses, and configures settings.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `_components/` | Editor-specific components (field editors, canvas) |
| `conversations/` | View for analyzing form responses/conversations (see `conversations/AGENTS.md`) |

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Main editor view |
| `layout.tsx` | Layout for form management (tabs for Editor/Responses/Settings) |
| `loading.tsx` | Loading state for the editor |

## For AI Agents

### Working In This Directory
- **Context**: The `formId` is available in params.
- **State**: Complex state management for the form builder (likely using a store or complex reducer).

<!-- MANUAL: -->
