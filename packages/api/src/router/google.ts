import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { googleDriveFormMetaSchema } from "@convoform/db/src/schema";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { createTRPCRouter } from "../trpc";

export const googleRouter = createTRPCRouter({
  getDriveFormsFiles: authProtectedProcedure
    .input(
      z.object({
        accessToken: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
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
        const errorData = await response.json();
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorData.error?.message || "Failed to fetch Google Forms",
        });
      }

      const data = await response.json();
      return googleDriveFormMetaSchema.array().parse(data.files);
    }),
});
