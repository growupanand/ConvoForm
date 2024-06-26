import { eq } from "@convoform/db";
import { formField, patchFormFieldSchema } from "@convoform/db/src/schema";

import { checkRateLimitThrowTRPCError } from "../lib/rateLimit";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const formFieldRouter = createTRPCRouter({
  patchFormField: protectedProcedure
    .input(patchFormFieldSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:edit",
      });

      const { id, ...updatedData } = input;

      const [updatedFormField] = await ctx.db
        .update(formField)
        .set({
          ...updatedData,
        })
        .where(eq(formField.id, id))
        .returning();
      if (!updatedFormField) {
        throw new Error("Failed to update form field");
      }
    }),
});
