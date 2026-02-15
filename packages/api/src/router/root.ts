import { createTRPCRouter } from "../trpc";
import { aiFormGenerationRouter } from "./aiFormGeneration";
import { conversationRouter } from "./conversation";
import { emailRouter } from "./email";
import { fileUploadRouter } from "./fileUpload";
import { formRouter } from "./form";
import { formDesignRouter } from "./formDesign";
import { formFieldRouter } from "./formField";
import { googleRouter } from "./google";
import { integrationRouter } from "./integration";
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
  fileUpload: fileUploadRouter,
  metrics: metricsRouter,
  webhook: webhookRouter,
  organization: organizationRouter,
  formField: formFieldRouter,
  formDesign: formDesignRouter,
  usage: usageRouter,
  google: googleRouter,
  users: usersRouter,
  aiFormGeneration: aiFormGenerationRouter,
  email: emailRouter,
  integration: integrationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
