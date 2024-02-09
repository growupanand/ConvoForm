import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        organizationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.workspace.create({
        data: {
          name: input.name,
          organizationId: input.organizationId,
          userId: ctx.userId,
        },
      });
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.workspace.findMany({
        where: {
          organizationId: input.organizationId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.workspace.findFirst({
        where: {
          id: input.id,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.workspace.delete({
        where: {
          id: input.id,
        },
      });
    }),

  patch: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.workspace.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
});
