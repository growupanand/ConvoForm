import { createTRPCRouter } from "../trpc";
import { conversationRouter } from "./conversation";
import { formRouter } from "./form";
import { formDesignRouter } from "./formDesign";
import { formFieldRouter } from "./formField";
import { googleRouter } from "./google";
import { metricsRouter } from "./metrics";
import { organizationRouter } from "./organization";
import { usageRouter } from "./usage";
import { usersRouter } from "./users";
import { webhookRouter } from "./webhook";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  form: formRouter,
  conversation: conversationRouter,
  metrics: metricsRouter,
  webhook: webhookRouter,
  organization: organizationRouter,
  formField: formFieldRouter,
  formDesign: formDesignRouter,
  usage: usageRouter,
  google: googleRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
