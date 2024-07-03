import { eq } from "@convoform/db";
import {
  formField,
  insertFormFieldSchema,
  patchFormFieldSchema,
  updateFormFieldSchema,
} from "@convoform/db/src/schema";

import { checkRateLimitThrowTRPCError } from "../lib/rateLimit";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const formFieldRouter = createTRPCRouter({
  createFormField: protectedProcedure
    .input(insertFormFieldSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:create",
      });
      const [newFormField] = await ctx.db
        .insert(formField)
        .values({
          ...input,
        })
        .returning();
      if (!newFormField) {
        throw new Error("Failed to create form field");
      }
    }),
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
  updateFormField: protectedProcedure
    .input(updateFormFieldSchema)
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
  deleteFormField: protectedProcedure
    .input(updateFormFieldSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const [deletedFormField] = await ctx.db
        .delete(formField)
        .where(eq(formField.id, id))
        .returning();
      if (!deletedFormField) {
        throw new Error("Failed to delete form field");
      }
      return deletedFormField;
    }),
});
