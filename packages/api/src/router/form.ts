import { and, eq } from "@convoform/db";
import {
  ANSWER_CHECK_PROVIDERS,
  form,
  formLabelSettingsSchema,
  newFormSchema,
  patchFormSchema,
} from "@convoform/db/src/schema";
import { fileUpload } from "@convoform/db/src/schema/fileUploads/fileUpload";
import { enforceRateLimit } from "@convoform/rate-limiter";
import { z } from "zod/v4";
import {
  type CreateFormInput,
  createForm,
  getOneFormWithFields,
  updateForm,
} from "../actions/form";
import { updateFormInputSchema } from "../actions/form/updateForm";
import { formNotFoundError, formOrgWhere } from "../lib/formAccess";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";

export const formRouter = createTRPCRouter({
  // Create form
  create: orgProtectedProcedure
    .input(newFormSchema)
    .mutation(async ({ input, ctx }) => {
      // The organization always comes from the session, never from the client.
      // Cast input to CreateFormInput due to type inference mismatch with formFields
      return await createForm(ctx, {
        ...input,
        organizationId: ctx.orgId,
      } as unknown as CreateFormInput);
    }),

  // Get all forms list for the caller's organization
  getAll: orgProtectedProcedure.query(async ({ ctx }) => {
    const forms = await ctx.db.query.form.findMany({
      where: (form, { eq }) => {
        return eq(form.organizationId, ctx.orgId);
      },
      orderBy: (form, { asc }) => asc(form.createdAt),
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

  getOneWithFields: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await getOneFormWithFields(input.id, ctx);
    }),

  // Patch partial form
  patch: orgProtectedProcedure
    .input(patchFormSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_EDIT(ctx.userId);

      const { id, ...updatedData } = input;
      const [updatedForm] = await ctx.db
        .update(form)
        .set({
          ...updatedData,
        })
        .where(formOrgWhere(ctx, id))
        .returning();

      if (!updatedForm) {
        throw formNotFoundError();
      }

      await ctx.analytics.track("form:update", {
        distinctId: ctx.userId,
        properties: input,
        groups: {
          organization: updatedForm.organizationId,
        },
      });

      return updatedForm;
    }),

  // Update the whole form
  updateForm: orgProtectedProcedure
    .input(updateFormInputSchema)
    .mutation(async ({ input, ctx }) => {
      return await updateForm(ctx, input);
    }),

  delete: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Execute database operations in a transaction
      const { deletedForm, filesToDelete } = await ctx.db.transaction(
        async (tx) => {
          // Delete the form first so a form from another organization can't
          // touch its files and we can return NOT_FOUND consistently.
          const [deletedForm] = await tx
            .delete(form)
            .where(formOrgWhere(ctx, input.id))
            .returning();

          if (!deletedForm) {
            throw formNotFoundError();
          }

          // Find all files associated with this form
          const filesToDelete = await tx.query.fileUpload.findMany({
            where: and(
              eq(fileUpload.formId, deletedForm.id),
              eq(fileUpload.isDeleted, false),
            ),
            columns: {
              id: true,
              storedPath: true,
              originalName: true,
            },
          });

          // Mark files as deleted in database
          for (const file of filesToDelete) {
            await tx
              .update(fileUpload)
              .set({
                isDeleted: true,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(fileUpload.id, file.id),
                  eq(fileUpload.formId, deletedForm.id),
                ),
              );
          }

          return { deletedForm, filesToDelete };
        },
      );

      // Delete files from storage (after successful DB transaction)
      // We do this outside the transaction because it's an external side effect
      const fileCleanupErrors: string[] = [];
      if (filesToDelete.length > 0) {
        // Dynamic import to avoid loading this if not needed
        const { FileStorageService } = await import("@convoform/file-storage");
        const fileStorageService = new FileStorageService();

        for (const file of filesToDelete) {
          try {
            await fileStorageService.deleteFile(file.storedPath);
            console.log(
              `Successfully deleted file: ${file.originalName} (${file.id}) for form ${input.id}`,
            );
          } catch (storageError) {
            const errorMsg = `Failed to delete file from storage: ${file.originalName} (${file.id}) - ${storageError instanceof Error ? storageError.message : "Unknown error"}`;
            console.error(errorMsg);
            fileCleanupErrors.push(errorMsg);
          }
        }
      }

      if (fileCleanupErrors.length > 0) {
        console.warn(
          `Form deletion completed with ${fileCleanupErrors.length} file cleanup errors for form ${input.id}`,
        );
      }

      await ctx.analytics.track("form:delete", {
        distinctId: ctx.userId,
        properties: {
          ...deletedForm,
          filesDeleted: filesToDelete.length,
          fileCleanupErrors: fileCleanupErrors.length,
        },
      });

      console.log(
        `Successfully deleted form ${input.id} with ${filesToDelete.length} associated files`,
      );

      return deletedForm;
    }),

  updateShowOrganizationName: orgProtectedProcedure
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

      const [updatedForm] = await ctx.db
        .update(form)
        .set({ showOrganizationName, organizationName })
        .where(formOrgWhere(ctx, input.formId))
        .returning();

      if (!updatedForm) {
        throw formNotFoundError();
      }

      return updatedForm;
    }),

  updateShowOrganizationLogo: orgProtectedProcedure
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

      const [updatedForm] = await ctx.db
        .update(form)
        .set({ showOrganizationLogo, organizationLogoUrl })
        .where(formOrgWhere(ctx, input.formId))
        .returning();

      if (!updatedForm) {
        throw formNotFoundError();
      }

      return updatedForm;
    }),

  updateShowCustomEndScreenMessage: orgProtectedProcedure
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

      const [updatedForm] = await ctx.db
        .update(form)
        .set({ showCustomEndScreenMessage, customEndScreenMessage })
        .where(formOrgWhere(ctx, input.formId))
        .returning();

      if (!updatedForm) {
        throw formNotFoundError();
      }

      return updatedForm;
    }),

  updateAnswerCheckProvider: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        answerCheckProvider: z.enum(ANSWER_CHECK_PROVIDERS),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [updatedForm] = await ctx.db
        .update(form)
        .set({ answerCheckProvider: input.answerCheckProvider })
        .where(formOrgWhere(ctx, input.formId))
        .returning();

      if (!updatedForm) {
        throw formNotFoundError();
      }

      await ctx.analytics.track("form:update_answer_check", {
        distinctId: ctx.userId,
        properties: {
          formId: input.formId,
          answerCheckProvider: input.answerCheckProvider,
        },
        groups: {
          organization: updatedForm.organizationId,
        },
      });

      return updatedForm;
    }),

  updateLabelSettings: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        labelSettings: formLabelSettingsSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [updatedForm] = await ctx.db
        .update(form)
        .set({ labelSettings: input.labelSettings })
        .where(formOrgWhere(ctx, input.formId))
        .returning();

      if (!updatedForm) {
        throw formNotFoundError();
      }

      await ctx.analytics.track("form:update_label_settings", {
        distinctId: ctx.userId,
        properties: {
          formId: input.formId,
          categoriesEnabled: input.labelSettings.categoriesEnabled,
          categoryCount: input.labelSettings.categories.length,
        },
        groups: {
          organization: updatedForm.organizationId,
        },
      });

      return updatedForm;
    }),

  updateIsPublished: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        isPublished: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { isPublished } = input;

      const [updatedForm] = await ctx.db
        .update(form)
        .set({ isPublished })
        .where(formOrgWhere(ctx, input.formId))
        .returning();

      if (!updatedForm) {
        throw formNotFoundError();
      }

      return updatedForm;
    }),
});
