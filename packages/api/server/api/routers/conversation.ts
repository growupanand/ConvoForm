import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const conversationRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(5),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.conversation.findMany({
        where: {
          formId: input.formId,
        },
        orderBy: {
          createdAt: "desc",
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
      return await ctx.db.conversation.findFirst({
        where: {
          id: input.id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(5),
        organizationId: z.string().min(5),
        name: z.string().min(1),
        formFieldsData: z.record(z.any()),
        transcript: z.array(z.record(z.any())),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.conversation.create({
        data: {
          ...input,
        },
      });
    }),

  getResponseCountByOrganization: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(5),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.conversation.count({
        where: {
          organizationId: input.organizationId,
        },
      });
    }),
});
