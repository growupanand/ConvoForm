<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# view

## Purpose
This directory handles the public view of a form. It determines which form to load and renders it.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `[formId]/` | The dynamic route for rendering a specific form by ID |

## For AI Agents

### Working In This Directory
- **Public Access**: This is the most critical public path. Performance and error handling are paramount.
- **Rendering**: Delegates to `components/formViewer`.

<!-- MANUAL: -->
