import { and, eq } from "@convoform/db";
import { form, newFormSchema, patchFormSchema } from "@convoform/db/src/schema";
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
    .input(updateFormInputSchema)
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
      // Execute database operations in a transaction
      const { deletedForm, filesToDelete } = await ctx.db.transaction(
        async (tx) => {
          // First, find and delete all files associated with this form
          const filesToDelete = await tx.query.fileUpload.findMany({
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

          // Mark files as deleted in database
          for (const file of filesToDelete) {
            await tx
              .update(fileUpload)
              .set({
                isDeleted: true,
                updatedAt: new Date(),
              })
              .where(eq(fileUpload.id, file.id));
          }

          // Now delete the form
          const [deletedForm] = await tx
            .delete(form)
            .where(eq(form.id, input.id))
            .returning();

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
