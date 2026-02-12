<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# docker

## Purpose
Contains Dockerfile definitions for containerizing the applications.

## Key Files
| File | Description |
|------|-------------|
| `Dockerfile-web` | Docker image definition for the Next.js web application |
| `Dockerfile-websocket-server` | Docker image definition for the WebSocket server |

## For AI Agents

### Working In This Directory
- When modifying Dockerfiles, ensure they use multi-stage builds for optimization.
- Check for environment variable requirements in the build and run stages.

<!-- MANUAL: -->
