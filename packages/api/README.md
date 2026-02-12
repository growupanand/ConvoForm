# @convoform/api

This package contains the tRPC API definition and routers for ConvoForm.

## Documentation

Detailed documentation for all available routers and procedures can be found in [docs/routers.md](./docs/routers.md).

## Structure

- `src/router/`: Individual router definitions (e.g., `form.ts`, `conversation.ts`)
- `src/root.ts`: Main app router combining all sub-routers
- `src/trpc.ts`: tRPC initialization and context definition

## Adding a New Router

1. Create a new file in `src/router/` (e.g., `myNewFeature.ts`).
2. Define your router using `createTRPCRouter`.
3. Add it to `appRouter` in `src/root.ts`.
