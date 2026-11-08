# @convoform/e2e

Playwright end-to-end tests for the web app. Playwright starts the web app itself (`pnpm --filter web run dev:turbo`) with `E2E_MOCK_LLM=1`, so conversations use the mock model in `packages/ai/src/e2eMockLanguageModel.ts` instead of a real one. Locally it reuses a server already running on port 3000, and reads env from the root `.env`.

## Projects

| Project | Specs | Auth |
|---|---|---|
| `setup` | `*.setup.ts` | Signs in the Clerk test user and saves `playwright/.auth/user.json` |
| `chromium` | every other `*.spec.ts` | Signed in (depends on `setup`) |
| `landing-smoke` | `*.smoke.spec.ts` | Signed out, no `setup` dependency |

## Commands

```bash
pnpm --filter @convoform/e2e e2e        # everything
pnpm --filter @convoform/e2e e2e:smoke  # landing smoke test only
```

## Landing smoke test

`src/tests/landing.smoke.spec.ts` protects the marketing landing page during the redesign:

- `/` returns 200 and the hero `h1` is visible.
- **Sign in** in the header reaches the Clerk sign-in page.
- The live demo renders and accepts one message (mocked LLM).

The database must contain a **published form with id `demo`** (the landing demo form). Each run adds one demo conversation, so point it at a development database or branch, never production. Run it locally with root `.env` (Clerk test keys and `DATABASE_URL`).

## Public pages smoke test

`src/tests/publicPages.smoke.spec.ts` covers the signed-out marketing pages:

- `/use-cases`, `/use-cases/study-abroad`, `/changelog`, `/privacy` and `/terms` load and show their `h1`.
- `/llms.txt` returns the public page and documentation links.
- Homepage ships `SoftwareApplication` and `FAQPage` JSON-LD; both use-case pages ship `FAQPage` JSON-LD that matches their rendered FAQs.
- `/view/demo` uses the published demo form name in its title instead of the generic "Submit Form".
- An unpublished form's `/view/[formId]` page serves the generic "Submit Form" title and keeps the form name and overview out of the head. This test creates a temporary unpublished form through the authenticated API, so it runs when the `setup` project has written `playwright/.auth/user.json` and skips otherwise.
- **Use cases** is linked from the header and footer, and the study-abroad CTA points at register.
- Changelog release anchors deep-link, expand older releases, and the page HTML stays under 100 KB.
- Privacy's table of contents tracks the scroll position.
- A public 404 URL renders the marketing shell.
- None of the pages scroll horizontally at 360px.

Both smoke specs run in the `landing-smoke` project (signed out, no `setup` dependency).
