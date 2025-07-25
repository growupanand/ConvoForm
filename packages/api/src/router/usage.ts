import { formSubmissionLimit } from "@convoform/common";
import { count, eq, sum } from "@convoform/db";
import { conversation, fileUpload } from "@convoform/db/src/schema";
import { formatFileSize } from "@convoform/file-storage";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { createTRPCRouter } from "../trpc";

export const usageRouter = createTRPCRouter({
  getUsgae: orgProtectedProcedure.query(async ({ ctx }) => {
    // Get conversations count
    const [conversationsResult] = await ctx.db
      .select({ value: count() })
      .from(conversation)
      .where(eq(conversation.organizationId, ctx.orgId));
    if (!conversationsResult) {
      throw new Error("Failed to get conversations count");
    }

    // Get file storage usage (sum of file sizes in bytes)
    const [storageResult] = await ctx.db
      .select({ value: sum(fileUpload.fileSize) })
      .from(fileUpload)
      .where(eq(fileUpload.organizationId, ctx.orgId));

    const conversationsCount = conversationsResult.value;
    const storageUsed = Number(storageResult?.value || 0); // Convert to number, default to 0
    const storageLimitBytes = 100 * 1024 * 1024; // 100MB in bytes

    return [
      {
        label: "Responses",
        value: conversationsCount,
        limit: formSubmissionLimit,
      },
      {
        label: "File Storage",
        value: storageUsed,
        readableValue: formatFileSize(storageUsed),
        limit: storageLimitBytes,
        readableLimit: formatFileSize(storageLimitBytes),
      },
    ];
  }),
});
