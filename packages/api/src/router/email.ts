import { eq } from "@convoform/db";
import { conversation, form, user } from "@convoform/db/src/schema";
import { sendFormResponseEmail } from "@convoform/email";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendContinueOnDesktopLink } from "../actions/email/sendContinueOnDesktopLink";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { internalProcedure } from "../procedures/internalProcedure";
import { createTRPCRouter } from "../trpc";
import { getBaseUrl } from "../utils/url";

export const emailRouter = createTRPCRouter({
  sendFormResponse: internalProcedure
    .input(
      z.object({
        responseId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .select({
          id: conversation.id,
          formId: conversation.formId,
          transcript: conversation.transcript,
          formFieldResponses: conversation.formFieldResponses,
          metaData: conversation.metaData,
          finishedAt: conversation.finishedAt,
          formName: form.name,
          ownerEmail: user.email,
        })
        .from(conversation)
        .innerJoin(form, eq(conversation.formId, form.id))
        .innerJoin(user, eq(form.userId, user.userId))
        .where(eq(conversation.id, input.responseId))
        .limit(1);

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      if (!result.finishedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Conversation is not finished",
        });
      }

      await sendFormResponseEmail({
        to: result.ownerEmail,
        formName: result.formName,
        responseId: result.id,
        currentFieldResponses: result.formFieldResponses.map((field) => ({
          fieldName: field.fieldName,
          fieldValue: field.fieldValue,
        })),
        transcript: result.transcript.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        metadata: result.metaData,
        responseLink: `${getBaseUrl()}/forms/${result.formId}/conversations/${result.id}`,
      });
    }),

  sendContinueOnDesktop: authProtectedProcedure.mutation(async ({ ctx }) => {
    return sendContinueOnDesktopLink({
      userId: ctx.userId,
      orgId: ctx.auth.orgId,
      user: ctx.user,
      analytics: ctx.analytics,
    });
  }),
});
