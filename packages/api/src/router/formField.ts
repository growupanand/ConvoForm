import { eq } from "@convoform/db";
import {
  form,
  formField,
  insertFormFieldSchema,
  patchFormFieldSchema,
  updateFormFieldSchema,
} from "@convoform/db/src/schema";

import { checkRateLimitThrowTRPCError } from "../lib/utils";
import { protectedProcedure } from "../middlewares/protectedRoutes";
import { createTRPCRouter } from "../trpc";

export const formFieldRouter = createTRPCRouter({
  // Create form field
  createFormField: protectedProcedure
    .input(insertFormFieldSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:create",
      });

      const existForm = await ctx.db.query.form.findFirst({
        where: (form, { eq }) => eq(form.id, input.formId),
        columns: { formFieldsOrders: true },
        with: {
          formFields: {
            columns: { id: true },
          },
        },
      });
      if (!existForm) {
        throw new Error("Form not found or invalid form id");
      }

      // Save new form field in database
      const [savedFormField] = await ctx.db
        .insert(formField)
        .values({
          ...input,
        })
        .returning();
      if (!savedFormField) {
        throw new Error("Failed to create form field");
      }

      ctx.analytics.track("formField:create", {
        properties: savedFormField,
      });

      // Update form fields orders
      let updatedFormFieldsOrders: string[] = [];
      const existFormFieldsOrders = existForm.formFieldsOrders || [];
      // If form fields orders exist and all form fields are in the orders, otherwise we will reset the form fields
      const shouldResetFormFieldsOrders =
        existFormFieldsOrders.length === 0 ||
        existFormFieldsOrders.length !== existForm.formFields.length;

      if (!shouldResetFormFieldsOrders) {
        updatedFormFieldsOrders = [...existFormFieldsOrders, savedFormField.id];
      }

      if (shouldResetFormFieldsOrders) {
        const exitFormFieldsIds = existForm.formFields.map((field) => field.id);
        updatedFormFieldsOrders = [...exitFormFieldsIds, savedFormField.id];
      }

      await ctx.db
        .update(form)
        .set({ formFieldsOrders: updatedFormFieldsOrders })
        .where(eq(form.id, input.formId))
        .returning();
    }),

  // Patch partial form field
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

      ctx.analytics.track("formField:update", {
        properties: input,
      });
    }),

  // Update the whole form field
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

      ctx.analytics.track("formField:update", {
        properties: input,
      });
    }),

  // Delete form field
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

      ctx.analytics.track("formField:delete", {
        properties: deletedFormField,
      });

      // Update form fields orders
      const existForm = await ctx.db.query.form.findFirst({
        where: (form, { eq }) => eq(form.id, deletedFormField.formId),
        columns: { formFieldsOrders: true },
        with: {
          formFields: {
            columns: { id: true },
          },
        },
      });

      if (!existForm) {
        throw new Error("Form not found or invalid form id");
      }

      const existFormFieldsOrders = existForm.formFieldsOrders || [];
      const updatedFormFieldsOrders = existFormFieldsOrders.filter(
        (fieldId) => fieldId !== deletedFormField.id,
      );
      const [updatedForm] = await ctx.db
        .update(form)
        .set({ formFieldsOrders: updatedFormFieldsOrders })
        .where(eq(form.id, deletedFormField.formId))
        .returning();

      if (!updatedForm) {
        throw new Error("Failed to update form fields orders");
      }

      return deletedFormField;
    }),
});
