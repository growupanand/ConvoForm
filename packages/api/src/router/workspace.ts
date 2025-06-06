import { eq } from "@convoform/db";
import {
  insertWorkspaceSchema,
  updateWorkspaceSchema,
  workspace,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { enforceRateLimit } from "@convoform/rate-limiter";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { createTRPCRouter } from "../trpc";

export const workspaceRouter = createTRPCRouter({
  create: authProtectedProcedure
    .input(insertWorkspaceSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit({
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
  getAll: authProtectedProcedure
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

  getOne: authProtectedProcedure
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

  delete: authProtectedProcedure
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

      if (!deletedWorkspace) {
        throw new Error("Unable to delete workspace");
      }

      return deletedWorkspace;
    }),

  patch: authProtectedProcedure
    .input(updateWorkspaceSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit({
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

      if (!updatedWorkspace) {
        throw new Error("Unable to update workspace");
      }

      return updatedWorkspace;
    }),
});
