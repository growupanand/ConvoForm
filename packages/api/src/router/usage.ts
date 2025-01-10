import { formSubmissionLimit } from "@convoform/common";
import { count, eq } from "@convoform/db";
import { conversation } from "@convoform/db/src/schema";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { createTRPCRouter } from "../trpc";

export const usageRouter = createTRPCRouter({
  getUsgae: orgProtectedProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({ value: count() })
      .from(conversation)
      .where(eq(conversation.organizationId, ctx.orgId));
    if (!result) {
      throw new Error("Failed to get conversations count");
    }

    const conversationsCount = result.value;

    return [
      {
        label: "Responses",
        value: conversationsCount,
        limit: formSubmissionLimit,
      },
    ];
  }),
});
