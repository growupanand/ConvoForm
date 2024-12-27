import { eq } from "@convoform/db";
import {
  insertWorkspaceSchema,
  updateWorkspaceSchema,
  workspace,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { checkRateLimitThrowTRPCError } from "../lib/utils";
import { protectedProcedure } from "../middlewares/protectedRoutes";
import { createTRPCRouter } from "../trpc";

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(insertWorkspaceSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:create",
      });
      const [result] = await ctx.db
        .insert(workspace)
        .values({
          name: input.name,
          organizationId: input.organizationId,
          userId: ctx.userId,
        })
        .returning();

      if (!result) {
        throw new Error("Unable to create workspace");
      }

      ctx.analytics.track("workspace:create", {
        properties: result,
      });

      return result;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.workspace.findMany({
        where: (workspace, { eq }) =>
          eq(workspace.organizationId, input.organizationId),
        orderBy: (workspace, { asc }) => [asc(workspace.createdAt)],
      });
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.workspace.findFirst({
        where: (workspace, { eq, and }) =>
          and(
            eq(workspace.id, input.id),
            eq(workspace.organizationId, input.organizationId),
          ),
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [deletedWorkspace] = await ctx.db
        .delete(workspace)
        .where(eq(workspace.id, input.id))
        .returning();
      ctx.analytics.track("workspace:delete", {
        properties: deletedWorkspace,
      });
      return deletedWorkspace;
    }),

  patch: protectedProcedure
    .input(updateWorkspaceSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:edit",
      });
      const [updatedWorkspace] = await ctx.db
        .update(workspace)
        .set({ name: input.name })
        .where(eq(workspace.id, input.id))
        .returning();

      ctx.analytics.track("workspace:update", {
        properties: input,
      });

      return updatedWorkspace;
    }),
});
