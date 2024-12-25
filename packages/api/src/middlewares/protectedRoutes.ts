import { analytics } from "@convoform/analytics";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth?.userId || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // provide analtyics instance to track prodcut events
  analytics.distinctId =
    ctx.user.primaryEmailAddress?.emailAddress ?? ctx.auth.userId;

  // Make ctx.userId non-nullable in protected procedures
  return next({
    ctx: { userId: ctx.auth.userId, auth: ctx.auth, user: ctx.user, analytics },
  });
});
