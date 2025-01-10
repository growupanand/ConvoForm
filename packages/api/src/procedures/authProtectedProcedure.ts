import type { User } from "@clerk/nextjs/server";
import { analytics } from "@convoform/analytics";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./publicProcedure";

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const authProtectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!isValidUserInCtx(ctx)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not logged in",
    });
  }

  // provide analtyics instance to track prodcut events
  analytics.distinctId =
    ctx.user.primaryEmailAddress?.emailAddress ?? ctx.auth.userId;

  // Make ctx.userId non-nullable in protected procedures
  return next({
    ctx: {
      ...ctx,
      userId: ctx.auth.userId,
      analytics,
    },
  });
});

function isValidUserInCtx(
  ctx: Record<string, any>,
): ctx is { auth: { userId: string }; user: User } {
  return typeof ctx.auth.userId === "string" && ctx.user;
}
