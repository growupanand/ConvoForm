import { conversationRouter } from "./routers/conversation";
import { formRouter } from "./routers/form";
import { metricsRouter } from "./routers/metrics";
import { postRouter } from "./routers/post";
import { workspaceRouter } from "./routers/workspace";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  workspace: workspaceRouter,
  form: formRouter,
  conversation: conversationRouter,
  metrics: metricsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
