import { and, eq, exists } from "@convoform/db";
import {
  form,
  formField,
  insertFormFieldSchema,
  patchFormFieldSchema,
  updateFormFieldSchema,
} from "@convoform/db/src/schema";

import { enforceRateLimit } from "@convoform/rate-limiter";
import { TRPCError } from "@trpc/server";
import { formNotFoundError, formOrgWhere } from "../lib/formAccess";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { type TRPCContext, createTRPCRouter } from "../trpc";

type FormFieldAccessContext = {
  db: TRPCContext["db"];
  orgId: string;
};

function formFieldOrgWhere(ctx: FormFieldAccessContext, formFieldId: string) {
  return and(
    eq(formField.id, formFieldId),
    exists(
      ctx.db
        .select({ id: form.id })
        .from(form)
        .where(
          and(
            eq(form.id, formField.formId),
            eq(form.organizationId, ctx.orgId),
          ),
        ),
    ),
  );
}

function formFieldNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Form field not found",
  });
}

export const formFieldRouter = createTRPCRouter({
  // Create form field
  createFormField: orgProtectedProcedure
    .input(insertFormFieldSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_CREATE(ctx.userId);

      const existForm = await ctx.db.query.form.findFirst({
        where: formOrgWhere(ctx, input.formId),
        columns: { formFieldsOrders: true },
        with: {
          formFields: {
            columns: { id: true },
          },
        },
      });
      if (!existForm) {
        throw formNotFoundError();
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

      await ctx.analytics.track("formField:create", {
        distinctId: ctx.userId,
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
        .where(formOrgWhere(ctx, input.formId))
        .returning();
    }),

  // Patch partial form field
  patchFormField: orgProtectedProcedure
    .input(patchFormFieldSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_EDIT(ctx.userId);

      const { id, ...updatedData } = input;

      const [updatedFormField] = await ctx.db
        .update(formField)
        .set({
          ...updatedData,
        })
        .where(formFieldOrgWhere(ctx, id))
        .returning();

      if (!updatedFormField) {
        throw formFieldNotFoundError();
      }

      await ctx.analytics.track("formField:update", {
        distinctId: ctx.userId,
        properties: input,
      });
    }),

  // Update the whole form field
  updateFormField: orgProtectedProcedure
    .input(updateFormFieldSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_EDIT(ctx.userId);

      const { id, ...updatedData } = input;

      const [updatedFormField] = await ctx.db
        .update(formField)
        .set({
          ...updatedData,
        })
        .where(formFieldOrgWhere(ctx, id))
        .returning();
      if (!updatedFormField) {
        throw formFieldNotFoundError();
      }

      await ctx.analytics.track("formField:update", {
        distinctId: ctx.userId,
        properties: input,
      });
    }),

  // Delete form field
  deleteFormField: orgProtectedProcedure
    .input(updateFormFieldSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const [deletedFormField] = await ctx.db
        .delete(formField)
        .where(formFieldOrgWhere(ctx, id))
        .returning();
      if (!deletedFormField) {
        throw formFieldNotFoundError();
      }

      await ctx.analytics.track("formField:delete", {
        distinctId: ctx.userId,
        properties: deletedFormField,
      });

      // Update form fields orders
      const existForm = await ctx.db.query.form.findFirst({
        where: formOrgWhere(ctx, deletedFormField.formId),
        columns: { formFieldsOrders: true },
        with: {
          formFields: {
            columns: { id: true },
          },
        },
      });

      if (!existForm) {
        throw formNotFoundError();
      }

      const existFormFieldsOrders = existForm.formFieldsOrders || [];
      const updatedFormFieldsOrders = existFormFieldsOrders.filter(
        (fieldId) => fieldId !== deletedFormField.id,
      );
      const [updatedForm] = await ctx.db
        .update(form)
        .set({ formFieldsOrders: updatedFormFieldsOrders })
        .where(formOrgWhere(ctx, deletedFormField.formId))
        .returning();

      if (!updatedForm) {
        throw new Error("Failed to update form fields orders");
      }

      return deletedFormField;
    }),
});
