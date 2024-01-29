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
});
