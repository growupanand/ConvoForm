import { TRPCError } from "@trpc/server";
import { authProtectedProcedure } from "./authProtectedProcedure";

export const orgProtectedProcedure = authProtectedProcedure.use(
  ({ ctx, next }) => {
    if (!isValidOrgIdInCtx(ctx)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Organization ID is missing",
      });
    }

    return next({
      ctx: {
        ...ctx,
        orgId: ctx.auth.orgId,
      },
    });
  },
);

function isValidOrgIdInCtx(
  ctx: Record<string, any>,
): ctx is { auth: { orgId: string } } {
  return typeof ctx.auth.orgId === "string";
}
