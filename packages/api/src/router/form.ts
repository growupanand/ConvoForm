import { and, count, eq, form, formField } from "@convoform/db";
import { z } from "zod";

import { checkRateLimitThrowTRPCError } from "../lib/rateLimit";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  formCreateSchema,
  formPatchSchema,
  formUpdateSchema,
} from "../validators/form";

export const formRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      formCreateSchema.extend({
        workspaceId: z.string().min(1),
        organizationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:create",
      });
      const [newForm] = await ctx.db
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
        })
        .returning();
      if (!newForm) {
        throw new Error("Failed to create form");
      }

      const emptyFormField = {
        fieldName: "",
        formId: newForm.id,
      };

      const formFields = input.formField.map((field) => ({
        ...field,
        formId: newForm.id,
      }));

      const newField = await ctx.db
        .insert(formField)
        .values(formFields.length > 0 ? formFields : [emptyFormField])
        .returning();
      return {
        ...newForm,
        formFields: [newField],
      };
    }),
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
      return await ctx.db.query.form.findFirst({
        where: eq(form.id, input.id),
        with: {
          workspace: true,
          formFields: true,
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
      return await ctx.db.delete(form).where(eq(form.id, input.id));
    }),

  patch: protectedProcedure
    .input(
      formPatchSchema.extend({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkRateLimitThrowTRPCError({
        identifier: ctx.userId,
        rateLimitType: "core:edit",
      });
      return await ctx.db
        .update(form)
        .set({ name: input.name })
        .where(eq(form.id, input.id))
        .returning();
    }),

  updateForm: protectedProcedure
    .input(
      formUpdateSchema.extend({
        id: z.string().min(1),
      }),
    )
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
          isPublished: true,
          updatedAt: new Date(),
        })
        .where(eq(form.id, input.id))
        .returning();

      await ctx.db.delete(formField).where(eq(formField.formId, input.id));
      const updatedFormFields = await ctx.db.insert(formField).values([
        ...input.formFields.map((field) => ({
          fieldName: field.fieldName,
          formId: input.id,
          updatedAt: new Date(),
        })),
      ]);

      return {
        ...updatedForm,
        formFields: updatedFormFields,
      };
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
});
