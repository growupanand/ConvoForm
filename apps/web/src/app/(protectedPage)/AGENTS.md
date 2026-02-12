<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# (protectedPage)

## Purpose
This route group contains all pages that require user authentication. It typically includes the dashboard, form builder, and settings.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `(mainPage)/` | The main dashboard view (see `(mainPage)/AGENTS.md`) |
| `auth/` | Authentication related pages (sign-in, register) - Note: These might be here for layout reasons or specific auth flows. |
| `forms/` | Form builder and management routes (see `forms/AGENTS.md`) |
| `organizations/` | Organization management routes |

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | The authenticated layout (likely includes sidebar, navbar) |
| `error.tsx` | Error boundary for protected pages |

## For AI Agents

### Working In This Directory
- **Auth**: Assume the user is authenticated in these routes (handled by middleware and layout).
- **Layout**: The `layout.tsx` here likely sets up the dashboard shell.

<!-- MANUAL: -->
