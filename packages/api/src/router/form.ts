import { and, count, eq } from "@convoform/db";
import {
  form,
  formDesign,
  formField,
  getSafeFormFieldsOrders,
  type insertFormFieldSchema,
  newFormSchema,
  patchFormSchema,
  restoreDateFields,
  updateFormSchema,
} from "@convoform/db/src/schema";
import { z } from "zod";

import {
  DEFAULT_FORM_DESIGN,
  FORM_SECTIONS_ENUMS_VALUES,
} from "@convoform/db/src/schema/formDesigns/constants";
import { checkRateLimitThrowTRPCError } from "../lib/rateLimit";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const formRouter = createTRPCRouter({
  // Create form
  create: protectedProcedure
    .input(
      newFormSchema.extend({
        workspaceId: z.string().min(1),
        organizationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:create",
      });

      // Create new form
      const [savedForm] = await ctx.db
        .insert(form)
        .values({
          userId: ctx.userId,
          organizationId: input.organizationId,
          workspaceId: input.workspaceId,
          name: input.name,
          overview: input.overview,
          welcomeScreenCTALabel: input.welcomeScreenCTALabel,
          welcomeScreenTitle: input.welcomeScreenTitle,
          welcomeScreenMessage: input.welcomeScreenMessage,
          isAIGenerated: input.isAIGenerated,
          isPublished: input.isPublished,
          endScreenCTAUrl: input.endScreenCTAUrl,
          endScreenCTALabel: input.endScreenCTALabel,
        })
        .returning();
      if (!savedForm) {
        throw new Error("Failed to create form");
      }

      // Create new form fields
      const emptyFormField: z.infer<typeof insertFormFieldSchema> = {
        fieldName: "",
        formId: savedForm.id,
        fieldDescription: "",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      };
      const givenFormFields = input.formFields.map((field) => ({
        ...field,
        formId: savedForm.id,
      }));
      const savedFormFields = await ctx.db
        .insert(formField)
        .values(givenFormFields.length > 0 ? givenFormFields : [emptyFormField])
        .returning();

      // Add form fields order
      const formFieldsOrders = savedFormFields.map((field) => field.id);
      await ctx.db
        .update(form)
        .set({ formFieldsOrders })
        .where(eq(form.id, savedForm.id))
        .returning();

      // Create form Design configuration
      const savedFormDesigns = FORM_SECTIONS_ENUMS_VALUES.map((screenType) => ({
        formId: savedForm.id,
        organizationId: input.organizationId,
        screenType,
        ...DEFAULT_FORM_DESIGN,
      }));

      await ctx.db.insert(formDesign).values(savedFormDesigns);

      return {
        ...savedForm,
        formFields: [savedFormFields],
        formDesigns: savedFormDesigns,
      };
    }),

  // Get all forms list
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        workspaceId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const forms = await ctx.db.query.form.findMany({
        where: (form, { eq, and }) =>
          and(
            eq(form.organizationId, input.organizationId),
            eq(form.workspaceId, input.workspaceId),
          ),
        orderBy: (form, { asc }) => [asc(form.createdAt)],
      });
      return forms;
    }),

  getOne: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.form.findFirst({
        where: eq(form.id, input.id),
      });
    }),

  getOneWithWorkspace: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.form.findFirst({
        where: eq(form.id, input.id),
        with: {
          workspace: true,
        },
      });
    }),

  getOneWithFields: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const formWithWorkspaceFields = await ctx.db.query.form.findFirst({
        where: eq(form.id, input.id),
        with: {
          workspace: true,
          formFields: true,
        },
        orderBy: (form, { asc }) => [asc(form.createdAt)],
      });

      if (!formWithWorkspaceFields) {
        return undefined;
      }

      const { workspace, formFields, ...restForm } = formWithWorkspaceFields;

      // Sort form fields
      const formFieldsOrders = getSafeFormFieldsOrders(restForm, formFields);
      const sortedFormFields = formFieldsOrders
        .map(
          // biome-ignore lint/style/noNonNullAssertion: ignored
          (id) => formFields.find((field) => field.id === id)!,
        )
        .map((field) => ({
          ...field,
          fieldConfiguration: restoreDateFields(field.fieldConfiguration),
        }));

      return {
        ...restForm,
        workspace,
        formFieldsOrders,
        formFields: sortedFormFields,
      };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(form).where(eq(form.id, input.id));
    }),

  // Patch partial form
  patch: protectedProcedure
    .input(patchFormSchema)
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:edit",
      });

      const { id, ...updatedData } = input;
      const [updatedForm] = await ctx.db
        .update(form)
        .set({
          ...updatedData,
        })
        .where(eq(form.id, id))
        .returning();

      if (!updatedForm) {
        throw new Error("Failed to update form");
      }
    }),

  // Update the whole form
  updateForm: protectedProcedure
    .input(updateFormSchema.omit({ formFields: true }))
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:edit",
      });

      const [updatedForm] = await ctx.db
        .update(form)
        .set({
          name: input.name,
          overview: input.overview,
          welcomeScreenCTALabel: input.welcomeScreenCTALabel,
          welcomeScreenTitle: input.welcomeScreenTitle,
          welcomeScreenMessage: input.welcomeScreenMessage,
          updatedAt: new Date(),
          formFieldsOrders: input.formFieldsOrders,
        })
        .where(eq(form.id, input.id))
        .returning();

      return updatedForm;
    }),

  deleteForm: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(form).where(eq(form.id, input.id));
    }),

  getAIGeneratedCountByOrganization: publicProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .select({ value: count() })
        .from(form)
        .where(
          and(
            eq(form.organizationId, input.organizationId),
            eq(form.isAIGenerated, true),
          ),
        );

      return result?.value;
    }),

  updateShowOrganizationName: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        showOrganizationName: z.boolean(),
        organizationName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { showOrganizationName, organizationName } = input;

      if (
        showOrganizationName &&
        (!organizationName || organizationName.trim() === "")
      ) {
        throw new Error("Organization name is required");
      }

      return await ctx.db
        .update(form)
        .set({ showOrganizationName, organizationName })
        .where(eq(form.id, input.formId));
    }),

  updateShowOrganizationLogo: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        showOrganizationLogo: z.boolean(),
        organizationLogoUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { showOrganizationLogo, organizationLogoUrl } = input;

      if (
        showOrganizationLogo &&
        (!organizationLogoUrl || organizationLogoUrl.trim() === "")
      ) {
        throw new Error("Organization logo url is required");
      }

      return await ctx.db
        .update(form)
        .set({ showOrganizationLogo, organizationLogoUrl })
        .where(eq(form.id, input.formId));
    }),

  updateShowCustomEndScreenMessage: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        showCustomEndScreenMessage: z.boolean(),
        customEndScreenMessage: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { showCustomEndScreenMessage } = input;
      const customEndScreenMessage =
        typeof input.customEndScreenMessage === "string"
          ? input.customEndScreenMessage.trim()
          : "";

      return await ctx.db
        .update(form)
        .set({ showCustomEndScreenMessage, customEndScreenMessage })
        .where(eq(form.id, input.formId));
    }),

  updateIsPublished: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        isPublished: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { isPublished } = input;

      return await ctx.db
        .update(form)
        .set({ isPublished })
        .where(eq(form.id, input.formId));
    }),
});
