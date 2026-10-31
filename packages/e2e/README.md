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
