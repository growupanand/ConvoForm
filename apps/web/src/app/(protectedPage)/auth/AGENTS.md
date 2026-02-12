<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# auth

## Purpose
Authentication related pages (Sign In, Register). Note that actual auth logic is handled by Clerk, but these pages provide the UI wrapper or custom flows.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `register/` | Registration page |
| `sign-in/` | Sign-in page |

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Auth layout (likely centered card) |

## For AI Agents

### Working In This Directory
- **Clerk**: Uses Clerk components (`<SignIn />`, `<SignUp />`) typically.
- **Redirects**: middleware.ts handles protection; these pages are for unauthenticated users.

<!-- MANUAL: -->
