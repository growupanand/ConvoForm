import { analytics } from "@convoform/analytics";
import { eq, sql } from "@convoform/db";
import {
  type PatchConversation,
  conversation,
  form,
  user,
} from "@convoform/db/src/schema";
import { trpcFetchClient } from "../../lib/trpc-client";
import type { ActionContext } from "../../types/actionContextType";
import { createWebhookDeliveriesForCompletedConversation } from "../webhook/createWebhookDeliveries";
import { buildConversationAnalyticsTrackPayload } from "./conversationAnalytics";
import { generateAndSaveInsights } from "./generateAndSaveInsights";
import { mergeConversationMetaDataForPatch } from "./mergeConversationMetaDataForPatch";

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

  const patchResult = await ctx.db.transaction(async (tx) => {
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
        metaData: true,
      },
    });

    const { metaData: incomingMetaData, ...restUpdatedData } = updatedData;

    const patchSet = {
      ...restUpdatedData,
      ...(incomingMetaData !== undefined
        ? {
            metaData: mergeConversationMetaDataForPatch(
              incomingMetaData,
              existingConversation?.metaData,
            ),
          }
        : {}),
    };

    const [updatedConversation] = await tx
      .update(conversation)
      .set(patchSet)
      .where(eq(conversation.id, id))
      .returning();

    if (!updatedConversation) {
      throw new Error("Failed to update conversation");
    }

    if (!existingConversation?.finishedAt) {
      await analytics.track(
        "conversation:update",
        buildConversationAnalyticsTrackPayload(updatedConversation),
      );
    }

    const isNewlyCompleted =
      updatedData.finishedAt && !existingConversation?.finishedAt;

    let isOwnerPreview = false;

    // Only send email if the conversation was NOT finished before, and is now finished
    if (isNewlyCompleted) {
      const result = await tx
        .select({
          userEmail: user.email,
        })
        .from(form)
        .innerJoin(user, eq(form.userId, user.userId))
        .where(eq(form.id, updatedConversation.formId))
        .limit(1);

      const [data] = result;

      isOwnerPreview =
        updatedConversation.metaData?.isOwnerPreview === true ||
        existingConversation?.metaData?.isOwnerPreview === true;

      await analytics.track("conversation:complete", {
        ...buildConversationAnalyticsTrackPayload({
          ...updatedConversation,
          metaData: {
            ...updatedConversation.metaData,
            isOwnerPreview,
          },
        }),
      });

      if (data?.userEmail) {
        return {
          emailPayload: {
            shouldSendEmail: true as const,
            responseId: updatedConversation.id,
          },
          isNewlyCompleted,
          isOwnerPreview,
          updatedConversation,
        };
      }
    }
    return {
      emailPayload: null,
      isNewlyCompleted,
      isOwnerPreview,
      updatedConversation: isNewlyCompleted ? updatedConversation : null,
    };
  });

  const {
    emailPayload,
    isNewlyCompleted,
    updatedConversation,
    isOwnerPreview,
  } = patchResult;

  if (isNewlyCompleted && updatedConversation) {
    try {
      await generateAndSaveInsights(
        {
          id: updatedConversation.id,
          formId: updatedConversation.formId,
          organizationId: updatedConversation.organizationId,
          finishedAt: updatedConversation.finishedAt,
          transcript: updatedConversation.transcript,
          formFieldResponses: updatedConversation.formFieldResponses,
          metaData: updatedConversation.metaData,
        },
        ctx,
        {
          trigger: "completed",
          isPartial: false,
          completionStatus: "completed",
        },
      );
    } catch (error) {
      console.error("Failed to generate insights on completion", error);
    }
  }

  if (isNewlyCompleted && updatedConversation && !isOwnerPreview) {
    try {
      await createWebhookDeliveriesForCompletedConversation(
        updatedConversation,
        ctx,
      );
    } catch (error) {
      const webhookError =
        error instanceof Error ? error : new Error(String(error));
      console.error("Failed to create webhook deliveries", webhookError);

      try {
        await analytics.captureException(webhookError, updatedConversation.id);
      } catch (analyticsError) {
        console.error(
          "Failed to report webhook delivery failure",
          analyticsError,
        );
      }
    }
  }

  if (emailPayload?.shouldSendEmail) {
    // Process integrations asynchronously
    (async () => {
      try {
        await trpcFetchClient.integration.sync.mutate({
          responseId: emailPayload.responseId,
        });
      } catch (error) {
        console.error("Failed to sync integrations", error);
      }
    })();

    try {
      await trpcFetchClient.email.sendFormResponse.mutate({
        responseId: emailPayload.responseId,
      });
    } catch (error) {
      const emailError =
        error instanceof Error ? error : new Error(String(error));
      console.error("Failed to send form response email", emailError);

      try {
        await analytics.captureException(emailError, emailPayload.responseId);
        await analytics.track("email:sendFailed", {
          distinctId: emailPayload.responseId,
          ...(updatedConversation?.organizationId
            ? {
                groups: {
                  organization: updatedConversation.organizationId,
                },
              }
            : {}),
          properties: {
            conversationId: emailPayload.responseId,
            formId: updatedConversation?.formId,
            organizationId: updatedConversation?.organizationId,
          },
        });
      } catch (analyticsError) {
        console.error(
          "Failed to report form response email failure",
          analyticsError,
        );
      }
    }
  }
}
