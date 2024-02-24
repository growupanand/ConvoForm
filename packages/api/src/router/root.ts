import { createTRPCRouter } from "../trpc";
import { conversationRouter } from "./conversation";
import { formRouter } from "./form";
import { metricsRouter } from "./metrics";
import { webhookRouter } from "./webhook";
import { workspaceRouter } from "./workspace";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  form: formRouter,
  conversation: conversationRouter,
  metrics: metricsRouter,
  webhook: webhookRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
