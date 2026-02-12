<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# file-storage

## Purpose
Abstractions for file storage, supporting AWS S3 (and compatible services like Cloudflare R2). It handles file uploads and retrieval.

## Key Files
| File | Description |
|------|-------------|
| `src/index.ts` | Entry point |
| `package.json` | Dependencies |

## For AI Agents

### Working In This Directory
- Use the exported functions to interact with object storage.
- Ensure presigned URLs are generated correctly for secure client-side uploads/downloads.

## Dependencies

### Internal
- `@convoform/db`

### External
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`
- `zod`

<!-- MANUAL: -->
