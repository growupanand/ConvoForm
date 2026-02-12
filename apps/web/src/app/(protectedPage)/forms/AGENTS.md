<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# forms

## Purpose
This directory handles individual form routes (edit, view, settings) within the authenticated area. Note that `(mainPage)/forms` handles the *list* of forms, while this directory handles *specific* forms by ID.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `[formId]/` | Dynamic route for a specific form (see `[formId]/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Dynamic Routing**: Uses `[formId]` to capture the form ID from the URL.
- **Context**: Often requires fetching the form details early in the component tree.

<!-- MANUAL: -->
