import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workspaceRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(5),
      }),
    )
    .query(async ({ input, ctx }) => {
      console.log({ "input.organizationId": input.organizationId });
      return await ctx.db.workspace.findMany({
        where: {
          organizationId: input.organizationId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        organizationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.workspace.create({
        data: {
          name: input.name,
          organizationId: input.organizationId,
          userId: ctx.userId,
        },
      });

      return result;
    }),
});
