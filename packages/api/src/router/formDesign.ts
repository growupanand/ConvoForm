import { eq } from "@convoform/db";
import {
  formDesign,
  insertFormDesignSchema,
  patchFormDesignSchema,
  selectFormDesignSchema,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { enforceRateLimit } from "@convoform/rate-limiter";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";

export const formDesignRouter = createTRPCRouter({
  create: authProtectedProcedure
    .input(insertFormDesignSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_CREATE(ctx.userId);
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
  getAll: publicProcedure
    .input(
      selectFormDesignSchema.pick({
        formId: true,
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.formDesign.findMany({
        where: (formDesign, { eq }) => eq(formDesign.formId, input.formId),
        orderBy: (formDesign, { asc }) => [asc(formDesign.createdAt)],
      });
    }),

  getOne: publicProcedure
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

  delete: authProtectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(formDesign).where(eq(formDesign.id, input.id));
    }),

  patch: authProtectedProcedure
    .input(patchFormDesignSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_EDIT(ctx.userId);

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

      ctx.analytics.track("formDesign:update", {
        properties: input,
      });
    }),
});
