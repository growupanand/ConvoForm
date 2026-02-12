<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# app

## Purpose
Next.js App Router directory containing all routes and pages for the web application.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `(public)/` | Publicly accessible pages (landing page, legal, etc.) |
| `(protectedPage)/` | Authenticated pages (dashboard, form builder) |
| `(formSubmissionPage)/` | Public form submission views (conversational/traditional) |
| `api/` | API Route Handlers (Next.js API routes) |
| `playground/` | Component and feature playgrounds |

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root layout |
| `global-error.tsx` | Global error boundary |
| `robots.ts` | SEO robots.txt generation |
| `sitemap.ts` | SEO sitemap generation |

## For AI Agents

### Working In This Directory
- **Route Groups**: Folders in parentheses `(group)` are route groups and don't affect the URL path.
- **Layouts**: Use `layout.tsx` for shared UI across routes.
- **Pages**: `page.tsx` defines the UI for a route.

<!-- MANUAL: -->
