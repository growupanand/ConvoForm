import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { googleDriveFormMetaSchema } from "@convoform/db/src/schema";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { createTRPCRouter } from "../trpc";
import { } from "@trpc/server/unstable-core-do-not-import";

export const googleRouter = createTRPCRouter({
    getDriveFormsFiles: authProtectedProcedure
        .input(
            z.object({
                accessToken: z.string().min(1),
            }),
        )
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
            return googleDriveFormMetaSchema.array().parse(data.files);
        }),
});
