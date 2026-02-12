<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# components

## Purpose
Application-specific React components. These are distinct from the shared UI library (`@convoform/ui`) in that they contain business logic or domain-specific UI.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `analytics/` | Analytics-related components |
| `common/` | Common application components |
| `formViewer/` | Components for rendering forms (conversational/standard) |
| `queryComponents/` | Components wrapping React Query/tRPC logic (e.g., tables) |
| `statsComponents/` | Components for displaying form statistics |

## Key Files
| File | Description |
|------|-------------|
| `app-sidebar.tsx` | Main application sidebar |
| `authProvider.tsx` | Authentication provider wrapper |
| `posthogUserInit.tsx` | PostHog user identification component |

## For AI Agents

### Working In This Directory
- Prefer using `@convoform/ui` primitives.
- Components here should generally be reusable within the app.
- Complex page-specific components should live in `app/[route]/_components/`.

<!-- MANUAL: -->
