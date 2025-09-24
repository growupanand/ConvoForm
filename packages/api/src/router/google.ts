import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  googleDriveFormMetaSchema,
  googleFormSchema,
  importGoogleFormSchema,
} from "@convoform/db/src/schema";
import {} from "@trpc/server/unstable-core-do-not-import";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { createTRPCRouter } from "../trpc";

const googleRouteInputSchema = z.object({
  accessToken: z.string().min(1),
});

export const googleRouter = createTRPCRouter({
  getGoogleForms: authProtectedProcedure
    .input(googleRouteInputSchema)
    .mutation(async ({ input }) => {
      // Fetch Google Forms from Drive API
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.form'&fields=files(id,name,modifiedTime,webViewLink)",
        {
          headers: {
            Authorization: `Bearer ${input.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch Google Forms",
        });
      }

      const data = await response.json();
      return googleDriveFormMetaSchema.array().parseAsync(data.files);
    }),
  getGoogleForm: authProtectedProcedure
    .input(
      googleRouteInputSchema.extend({
        formId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      // Fetch single Google Form details
      const response = await fetch(
        `https://forms.googleapis.com/v1/forms/${input.formId}`,
        {
          headers: {
            Authorization: `Bearer ${input.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        const errorMsg =
          error?.error?.message || error?.message || "Unknown error";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch Google Form details: ${errorMsg}`,
        });
      }

      const data = await response.json();
      // Check if form has sufficient data to import
      const validForm = await importGoogleFormSchema.parseAsync(data);
      return googleFormSchema.parseAsync(validForm);
    }),
});
