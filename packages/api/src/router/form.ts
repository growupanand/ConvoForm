import { and, eq } from "@convoform/db";
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
import { fileUpload } from "@convoform/db/src/schema/fileUploads/fileUpload";
import { z } from "zod/v4";

import {
  DEFAULT_FORM_DESIGN,
  FORM_SECTIONS_ENUMS_VALUES,
} from "@convoform/db/src/schema/formDesigns/constants";
import { enforceRateLimit } from "@convoform/rate-limiter";
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
      await enforceRateLimit.CORE_CREATE(ctx.userId);

      // Create new form
      const [savedForm] = await ctx.db
        .insert(form)
        .values({
          userId: ctx.userId,
          organizationId: input.organizationId,
          name: input.name,
          overview: input.overview,
          welcomeScreenCTALabel: input.welcomeScreenCTALabel,
          welcomeScreenTitle: input.welcomeScreenTitle,
          welcomeScreenMessage: input.welcomeScreenMessage,
          isAIGenerated: input.isAIGenerated,
          isPublished: input.isPublished,
          endScreenCTAUrl: input.endScreenCTAUrl,
          endScreenCTALabel: input.endScreenCTALabel,
          googleFormId: input.googleFormId,
        })
        .returning();
      if (!savedForm) {
        throw new Error("Failed to create form");
      }

      ctx.analytics.track("form:create", {
        properties: {
          ...savedForm,
          importedFromGoogleForms: Boolean(input.googleFormId),
        },
        groups: {
          organization: savedForm.organizationId,
        },
      });

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

      if (!savedFormFields) {
        throw new Error("Failed to create form fields");
      }

      if (givenFormFields.length > 0) {
        for (const field of savedFormFields) {
          ctx.analytics.track("formField:create", {
            properties: {
              ...field,
            },
            groups: {
              organization: savedForm.organizationId,
            },
          });
        }
      }

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
      const formWithFields = await ctx.db.query.form.findFirst({
        where: eq(form.id, input.id),
        with: {
          formFields: true,
        },
        orderBy: (form, { asc }) => [asc(form.createdAt)],
      });

      if (!formWithFields) {
        return undefined;
      }

      const { formFields, ...restForm } = formWithFields;

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
        formFieldsOrders,
        formFields: sortedFormFields,
      };
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
      await enforceRateLimit.CORE_EDIT(ctx.userId);

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
