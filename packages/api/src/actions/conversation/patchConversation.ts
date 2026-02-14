import { analytics } from "@convoform/analytics";
import { eq, sql } from "@convoform/db";
import {
  type PatchConversation,
  conversation,
  form,
  user,
} from "@convoform/db/src/schema";
import { env } from "../../env";
import { trpcFetchClient } from "../../lib/trpc-client";
import type { ActionContext } from "../../types/actionContextType";
import { getBaseUrl } from "../../utils/url";

export async function patchConversation(
  input: PatchConversation,
  ctx: ActionContext,
) {
  const {
    id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...updatedData
  } = input;

  const emailPayload = await ctx.db.transaction(async (tx) => {
    // Lock the conversation row to prevent race conditions
    await tx.execute(
      sql`SELECT 1 FROM ${conversation} WHERE ${conversation.id} = ${id} FOR NO KEY UPDATE`,
    );

    /*
     * We need to check if the conversation is already finished to avoid sending duplicate emails
     * This is because the client might send multiple patch requests with finishedAt
     */
    const existingConversation = await tx.query.conversation.findFirst({
      where: eq(conversation.id, id),
      columns: {
        finishedAt: true,
      },
    });

    const [updatedConversation] = await tx
      .update(conversation)
      .set({
        ...updatedData,
      })
      .where(eq(conversation.id, id))
      .returning();

    if (!updatedConversation) {
      throw new Error("Failed to update conversation");
    }

    analytics.track("conversation:update", {
      properties: input,
    });

    // Only send email if the conversation was NOT finished before, and is now finished
    if (updatedData.finishedAt && !existingConversation?.finishedAt) {
      const result = await tx
        .select({
          userEmail: user.email,
          formName: form.name,
        })
        .from(form)
        .innerJoin(user, eq(form.userId, user.userId))
        .where(eq(form.id, updatedConversation.formId))
        .limit(1);

      const [data] = result;

      if (data?.userEmail) {
        return {
          shouldSendEmail: true,
          email: data.userEmail,
          formName: data.formName,
          responseId: updatedConversation.id,
          transcript: updatedConversation.transcript.map((t) => ({
            role: t.role,
            content: t.content,
          })),
          formFieldResponses: updatedConversation.formFieldResponses.map(
            (field) => ({
              fieldName: field.fieldName,
              fieldValue: field.fieldValue,
            }),
          ),
          metadata: updatedConversation.metaData,
          responseLink: `${getBaseUrl()}/forms/${updatedConversation.formId}/conversations/${updatedConversation.id}`,
        };
      }
    }
    return null;
  });

  if (emailPayload?.shouldSendEmail) {
    try {
      await trpcFetchClient.email.sendFormResponse.mutate({
        to: emailPayload.email,
        formName: emailPayload.formName,
        responseId: emailPayload.responseId,
        secret: env.INTERNAL_EMAIL_API_SECRET || "",
        currentFieldResponses: emailPayload.formFieldResponses,
        transcript: emailPayload.transcript,
        metadata: emailPayload.metadata as Record<string, any>,
        responseLink: emailPayload.responseLink,
      });
    } catch (error) {
      console.error("Failed to send form response email", error);
    }
  }
}
