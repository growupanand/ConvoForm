<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# src

## Purpose
Source code for the database package. Contains schema definitions, migration logic, and the database client.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `schema/` | Drizzle ORM schema definitions (tables, relations) |
| `tests/` | Database tests |

## Key Files
| File | Description |
|------|-------------|
| `db.ts` | Database client initialization |
| `migrate.ts` | Migration runner script |
| `script.ts` | Utility script entry point |

## For AI Agents

### Working In This Directory
- **Schema**: Add new tables in `schema/` and export them.
- **Migrations**: Run migration generation after schema changes.
- **Client**: Import `db` from this package to query the database.

<!-- MANUAL: -->
