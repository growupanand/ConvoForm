# AGENTS.md

Guidance for AI coding agents (opencode, Codex, Copilot, Claude, …) working in this repository.

## Git commits

The rules below are derived from this repo's own history (`git log -100`) plus `.commitlintrc.cjs`. Follow them exactly, and re-check `git log --oneline -100` before writing a message if you are unsure.

### Message format

```text
<type>: <emoji> <subject>

<optional body>

✅ Closes: #<issue-number>
```

### Subject line

- Exact spacing: `type`, colon, one space, `emoji`, one space, `subject` — e.g. `chore: 🤖 add opencode new agent`.
- `type` is lowercase and taken from the table below. **No `scope(...)`** — 0 of the last 100 commits use one.
- First word after the emoji is lowercase (87 of 92 conventional commits), imperative mood, no trailing period.
- Max **64 characters** (the `czg` limit in `.commitlintrc.cjs`). 17 of the last 100 exceeded it — do not copy those.
- Never end with a PR reference like `(#482)`; that form only comes from GitHub squash merges.

### Types and emoji

| type     | emoji   | when to use                                            | last 100 |
| -------- | ------- | ------------------------------------------------------ | -------- |
| `chore`  | 🤖      | default: tooling, config, deps, skills, non-user-facing | 59       |
| `feat`   | 🚀      | new user-visible behaviour                              | 14       |
| `fix`    | 🐛      | bug fix                                                 | 6        |
| `refactor` | 💡    | code change with no behaviour change                    | 3        |
| `perf`   | ⚡️      | performance improvement                                 | 3        |
| `docs`   | 📚      | documentation only                                      | 3        |
| `style`  | 💄      | markup/formatting/UI styling                            | 2        |
| `release`| 🏹      | release notes / version bumps                           | 2        |
| `ci`     | 🎡      | CI workflows                                            | 0        |

If nothing fits better, use `chore`.

### Body (optional, ~29 of the last 100 commits have one)

- Blank line between subject and body.
- One short paragraph saying **why**, then `-` bullets for **what** changed.
- Keep it factual; no restating the diff line by line.

### Footer

- Write `✅ Closes: #123` — the `#` is mandatory. All 28 pre-existing footers use it; `Closes: 488` (no `#`) was a defect that had to be amended.
- Footer is the last line, preceded by a blank line.
- Only this exact form is used in this repo: **no** `Fixes:`, `Resolves:`, `Refs:`, `Close:`.
- Omit the footer entirely when the commit does not close an issue.

### Example from history

```text
feat: 🚀 add google sheet integration for sync form responses

✅ Closes: #482
```

With a body:

```text
fix: 🐛 serve robots.txt and sitemap.xml and add canonical urls

Clerk middleware answered 404 for /robots.txt and /sitemap.xml because
they were not in isPublicRoute.

- allow robots.txt and sitemap.xml through the Clerk proxy
- list all public www routes in the sitemap

✅ Closes: #488
```

### Do not write

```text
feat: Add new stuff.            ← capital, no emoji, trailing period
chore: fix stuff (#482)          ← squash-merge style, wrong emoji
Update README.md                 ← GitHub web edit, not a commit message
wip / temp / misc                ← meaningless subject
✅ Closes: 488                   ← missing the #
chore(scope): something          ← no scopes in this repo
```

### Before you commit

- Stage the exact files you changed (`git add <paths>`), then check `git status`.
- The `pre-commit` hook runs `pnpm format`, `pnpm lint`, `pnpm type-check` **and then `git add .`** — everything left in the working tree gets swept into the commit. Make sure no unrelated or generated files are sitting there.
- There is **no `commit-msg` hook**: a malformed message is accepted silently. The format is your responsibility.
- Run `pnpm lint-ci` and `pnpm type-check-ci` if you are not confident the hook will catch it.
- Never commit `.env`, secrets, keys, or lockfile churn you did not intend.
- Only commit when explicitly asked; never push, force-push, amend published commits, or open a PR unless asked.
- `pnpm commit` opens the interactive `czg` prompt (this is what humans use).
