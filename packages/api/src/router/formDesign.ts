import { eq } from "@convoform/db";
import {
  formDesign,
  insertFormDesignSchema,
  patchFormDesignSchema,
  selectFormDesignSchema,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { checkRateLimitThrowTRPCError } from "../lib/rateLimit";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const formDesignRouter = createTRPCRouter({
  create: protectedProcedure
    .input(insertFormDesignSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:create",
      });
      const [result] = await ctx.db
        .insert(formDesign)
        .values({
          formId: input.formId,
          organizationId: input.organizationId,
          screenType: input.screenType,
          backgroundColor: input.backgroundColor,
          fontColor: input.fontColor,
        })
        .returning();

      if (!result) {
        throw new Error("Unable to create formDesign");
      }

      return result;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.formDesign.findMany({
        where: (formDesign, { eq }) =>
          eq(formDesign.organizationId, input.organizationId),
        orderBy: (formDesign, { asc }) => [asc(formDesign.createdAt)],
      });
    }),

  getOne: protectedProcedure
    .input(
      selectFormDesignSchema
        .pick({
          formId: true,
          id: true,
          screenType: true,
        })
        .partial()
        .required({
          screenType: true,
        }),
    )
    .query(async ({ input, ctx }) => {
      if (!input.id && !input.formId) {
        throw new Error("id or formId is required");
      }

      const conditions = [eq(formDesign.screenType, input.screenType)];

      if (input.id) {
        conditions.push(eq(formDesign.id, input.id));
      }

      if (input.formId) {
        conditions.push(eq(formDesign.formId, input.formId));
      }

      return await ctx.db.query.formDesign.findFirst({
        where: (_, { and }) => and(...conditions),
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(formDesign).where(eq(formDesign.id, input.id));
    }),

  patch: protectedProcedure
    .input(patchFormDesignSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:edit",
      });

      const { id, ...updatedData } = input;
      const [updatedForm] = await ctx.db
        .update(formDesign)
        .set({
          ...updatedData,
        })
        .where(eq(formDesign.id, id))
        .returning();

      if (!updatedForm) {
        throw new Error("Failed to update formDesign");
      }
    }),
});
