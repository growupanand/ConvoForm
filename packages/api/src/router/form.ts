import { and, eq } from "@convoform/db";
import {
  form,
  newFormSchema,
  patchFormSchema,
  updateFormSchema,
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
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";

export const formRouter = createTRPCRouter({
  // Create form
  create: authProtectedProcedure
    .input(
      newFormSchema.extend({
        organizationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Cast input to CreateFormInput due to type inference mismatch with formFields
      return await createForm(ctx, input as unknown as CreateFormInput);
    }),

  // Get all forms list
  getAll: authProtectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const forms = await ctx.db.query.form.findMany({
        where: (form, { eq }) => {
          return eq(form.organizationId, input.organizationId);
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
  patch: authProtectedProcedure
    .input(patchFormSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_EDIT(ctx.userId);

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

      ctx.analytics.track("form:update", {
        properties: input,
        groups: {
          organization: updatedForm.organizationId,
        },
      });

      return updatedForm;
    }),

  // Update the whole form
  updateForm: authProtectedProcedure
    .input(updateFormSchema.omit({ formFields: true }))
    .mutation(async ({ input, ctx }) => {
      return await updateForm(ctx, input);
    }),

  delete: authProtectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // First, find and delete all files associated with this form
      const filesToDelete = await ctx.db.query.fileUpload.findMany({
        where: and(
          eq(fileUpload.formId, input.id),
          eq(fileUpload.isDeleted, false),
        ),
        columns: {
          id: true,
          storedPath: true,
          originalName: true,
        },
      });

      // Delete files from storage and mark as deleted in database
      const fileCleanupErrors: string[] = [];
      for (const file of filesToDelete) {
        try {
          // Mark file as deleted in database first
          await ctx.db
            .update(fileUpload)
            .set({
              isDeleted: true,
              updatedAt: new Date(),
            })
            .where(eq(fileUpload.id, file.id));

          // Delete from R2 storage
          try {
            const { FileStorageService } = await import(
              "@convoform/file-storage"
            );
            const fileStorageService = new FileStorageService();
            await fileStorageService.deleteFile(file.storedPath);
            console.log(
              `Successfully deleted file: ${file.originalName} (${file.id}) for form ${input.id}`,
            );
          } catch (storageError) {
            const errorMsg = `Failed to delete file from storage: ${file.originalName} (${file.id}) - ${storageError instanceof Error ? storageError.message : "Unknown error"}`;
            console.error(errorMsg);
            fileCleanupErrors.push(errorMsg);
            // Continue with form deletion even if file storage deletion fails
          }
        } catch (fileError) {
          const errorMsg = `Error deleting file ${file.id}: ${fileError instanceof Error ? fileError.message : "Unknown error"}`;
          console.error(errorMsg);
          fileCleanupErrors.push(errorMsg);
        }
      }

      if (fileCleanupErrors.length > 0) {
        console.warn(
          `Form deletion proceeding with ${fileCleanupErrors.length} file cleanup errors for form ${input.id}`,
        );
      }

      // Now delete the form
      const [deletedForm] = await ctx.db
        .delete(form)
        .where(eq(form.id, input.id))
        .returning();

      if (deletedForm) {
        ctx.analytics.track("form:delete", {
          properties: {
            ...deletedForm,
            filesDeleted: filesToDelete.length,
            fileCleanupErrors: fileCleanupErrors.length,
          },
        });

        console.log(
          `Successfully deleted form ${input.id} with ${filesToDelete.length} associated files`,
        );
      }

      return deletedForm;
    }),

  updateShowOrganizationName: authProtectedProcedure
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

  updateShowOrganizationLogo: authProtectedProcedure
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

  updateShowCustomEndScreenMessage: authProtectedProcedure
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

  updateIsPublished: authProtectedProcedure
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
