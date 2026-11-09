import { analytics } from "@convoform/analytics";
import { eq, sql } from "@convoform/db";
import {
  type PatchConversation,
  conversation,
  form,
  user,
} from "@convoform/db/src/schema";
import { createConversationLogger } from "@convoform/logger";
import { trpcFetchClient } from "../../lib/trpc-client";
import type { ActionContext } from "../../types/actionContextType";
import { createWebhookDeliveriesForCompletedConversation } from "../webhook/createWebhookDeliveries";
import { buildConversationAnalyticsTrackPayload } from "./conversationAnalytics";
import { generateAndSaveInsights } from "./generateAndSaveInsights";
import { mergeConversationMetaDataForPatch } from "./mergeConversationMetaDataForPatch";

export async function patchConversation(
  input: PatchConversation,
  ctx: ActionContext,
  options: { deferAnalytics?: boolean } = {},
) {
  const {
    id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    isInProgress: _isInProgress,
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
      // `isInProgress` is owned by the conversation started/stopped events.
      // A stream snapshot can still carry the value from before the started
      // event, so only completion is allowed to write it here.
      ...(updatedData.finishedAt ? { isInProgress: false } : {}),
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
          analyticsConversation: updatedConversation,
        };
      }
    }
    return {
      emailPayload: null,
      isNewlyCompleted,
      isOwnerPreview,
      updatedConversation: isNewlyCompleted ? updatedConversation : null,
      analyticsConversation: existingConversation?.finishedAt
        ? null
        : updatedConversation,
    };
  });

  const {
    emailPayload,
    isNewlyCompleted,
    updatedConversation,
    isOwnerPreview,
    analyticsConversation,
  } = patchResult;

  if (analyticsConversation) {
    const trackUpdate = analytics.track(
      "conversation:update",
      buildConversationAnalyticsTrackPayload(analyticsConversation),
    );

    if (options.deferAnalytics) {
      void trackUpdate.catch(() => undefined);
    } else {
      try {
        await trackUpdate;
      } catch {
        // Analytics must never fail the conversation patch.
      }
    }
  }

  const logger = createConversationLogger({
    conversationId: updatedConversation?.id ?? id,
    ...(updatedConversation?.formId
      ? { formId: updatedConversation.formId }
      : {}),
    ...(updatedConversation?.organizationId
      ? { organizationId: updatedConversation.organizationId }
      : {}),
  });

  if (isNewlyCompleted && updatedConversation) {
    // Create delivery rows before the LLM insights call so a slow or failing
    // insights request can never prevent webhooks from being queued.
    if (!isOwnerPreview) {
      try {
        await createWebhookDeliveriesForCompletedConversation(
          {
            ...updatedConversation,
            isOwnerPreview,
          },
          ctx,
        );
      } catch (error) {
        const webhookError =
          error instanceof Error ? error : new Error(String(error));

        try {
          await analytics.captureException(
            webhookError,
            updatedConversation.id,
          );
        } catch {
          // Webhook failures must never block insights or the owner email.
        }
      }
    }

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
      logger.error("insights:failed", {
        trigger: "completed",
        error: error instanceof Error ? error.message : String(error),
      });
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
        logger.error("integration:sync:failed", {
          responseId: emailPayload.responseId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    try {
      await trpcFetchClient.email.sendFormResponse.mutate({
        responseId: emailPayload.responseId,
      });
    } catch (error) {
      const emailError =
        error instanceof Error ? error : new Error(String(error));
      logger.error("email:sendFailed", {
        responseId: emailPayload.responseId,
        error: emailError.message,
      });

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
        logger.error("email:sendFailed:analytics:failed", {
          responseId: emailPayload.responseId,
          error:
            analyticsError instanceof Error
              ? analyticsError.message
              : String(analyticsError),
        });
      }
    }
  }

  try {
    await logger.flush();
  } catch {
    // Logging must never fail the conversation patch path.
  }
}
