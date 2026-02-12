<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# router

## Purpose
Defines the tRPC routers for the API. Each file typically corresponds to a domain or feature area.

## Key Files
| File | Description |
|------|-------------|
| `root.ts` | The root router merging all sub-routers |
| `aiFormGeneration.ts` | Procedures for AI form generation |
| `conversation.ts` | Procedures for managing conversations |
| `fileUpload.ts` | Procedures for file uploads |
| `form.ts` | Procedures for form management |
| `formDesign.ts` | Procedures for form styling/design |
| `formField.ts` | Procedures for form fields |
| `google.ts` | Google integration procedures |
| `metrics.ts` | Metrics and analytics procedures |
| `organization.ts` | Organization management |
| `usage.ts` | Usage tracking procedures |
| `users.ts` | User management procedures |
| `webhook.ts` | Webhook handling procedures |

## For AI Agents

### Working In This Directory
- **New Features**: Add new routers here and register them in `root.ts`.
- **Procedures**: Use `publicProcedure` or `protectedProcedure` from `../trpc`.

<!-- MANUAL: -->
