---
name: app-browser
description: Drive the ConvoForm web app in a real browser to capture screenshots or walk product flows. Use when you need authenticated in-app pages (form editor, responses), public form submission, or marketing screenshots without manual clicking.
allowed-tools: Bash(pnpm:*)
---

# ConvoForm app browser (Playwright)

Use this instead of manual screenshots or `agent-browser` (not installed in this repo).

## Prerequisites

1. Start the app with a **real** LLM (not the e2e mock):

   ```bash
   pnpm dev
   ```

2. Do **not** set `E2E_MOCK_LLM=1` in the shell that runs scenarios.

3. Root `.env` must include Clerk test keys and AI provider config (same as local development).

## Run a scenario

From the repo root:

```bash
pnpm --filter @convoform/e2e agent src/agent/scenarios/<scenario>.ts
```

The runner:

- Fails if the dev server is down or `E2E_MOCK_LLM=1`
- Signs in via Clerk test user (`packages/e2e/src/utils/clerk.ts`) — **do not** type credentials into the Clerk UI
- Uses a 1280×800 viewport and marketing frame for captures
- Writes PNGs to paths you pass to `shot()` (repo-relative or absolute)
- `shot({ mode: "viewport" })` — full 1280×800 clip
- `shot({ mode: "element", selector })` — crop to a DOM node (marketing targets use `data-marketing-screenshot`)
- `shot({ mode: "tight", selector })` — shrink-wrap direct children of an element, capped to the frame

## Writing scenarios

Add a file under `packages/e2e/src/agent/scenarios/`:

```typescript
import type { AgentScenario } from "../types";

const scenario: AgentScenario = async ({ page, shot, repoRoot }) => {
  await page.goto("/forms");
  await shot({
    name: "example",
    out: "apps/web/public/images/example.png",
    selector: "main", // optional; defaults to body
  });
};

export default scenario;
```

Shared UI helpers: `packages/e2e/src/agent/helpers/formUi.ts`.

## Routes agents use often

| Area | Path |
|------|------|
| Form list | `/forms` |
| Form editor | `/forms/[formId]` |
| Responses analytics | `/forms/[formId]/conversations` |
| Single response | `/forms/[formId]/conversations/[conversationId]` |
| Public form | `/view/[formId]` (no auth) |

## Screenshot hygiene

- Use **synthetic** student data only in captures (no real PII).
- Output only to paths declared in the scenario (usually `apps/web/public/...`).
- Do not commit `packages/e2e/playwright/.auth/` (gitignored).

## vs `pnpm e2e`

`pnpm e2e` starts its own dev server with `E2E_MOCK_LLM=1`. Agent scenarios attach to your running `pnpm dev` instance and call the real model.
