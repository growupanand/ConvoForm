<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# e2e

## Purpose
This package contains end-to-end tests for the ConvoForm application, using Playwright. It ensures critical user flows (like creating a form, filling it out, and viewing results) work as expected.

## Key Files
| File | Description |
|------|-------------|
| `playwright.config.ts` | Playwright configuration |
| `package.json` | Dependencies and scripts |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `playwright/` | Global setup/teardown scripts |
| `src/` | Test files |

## For AI Agents

### Working In This Directory
- **Tests**: Write tests in `src/`.
- **Selectors**: Use resilient selectors (like `getByRole`, `getByText`) rather than specific classes.
- **Authentication**: Use Clerk testing helpers or setup scripts to handle auth state.

### Testing Requirements
- Run `pnpm e2e` to execute tests.
- Use `pnpm codegen` to help generate tests interactively.

## Dependencies

### External
- `@playwright/test`
- `@clerk/testing`
- `@axe-core/playwright` (Accessibility testing)

<!-- MANUAL: -->
