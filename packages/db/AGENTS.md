<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# db

## Purpose
This package manages the database layer using Drizzle ORM. It includes the schema definitions, migrations, and the database client connection.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Exports the database client and schema |
| `drizzle.config.ts` | Configuration for Drizzle Kit |
| `src/schema/` | Database schema definitions |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/schema/` | Table definitions grouped by domain (users, forms, etc.) |
| `drizzle/` | Migration files |

## For AI Agents

### Working In This Directory
- When modifying schema, run `pnpm drizzle:generate-migration`.
- Use Drizzle ORM query builder for data access.
- Ensure `zod` schemas match database constraints where applicable.

### Testing Requirements
- Run `pnpm type-check` to verify schema types.

## Dependencies

### External
- `drizzle-orm`
- `drizzle-kit`
- `@neondatabase/serverless`
- `zod`

<!-- MANUAL: -->
