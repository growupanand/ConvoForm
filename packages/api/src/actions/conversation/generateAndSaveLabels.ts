import { generateConversationLabels } from "@convoform/ai";
import { eq, sql } from "@convoform/db";
import {
  type Conversation,
  type RespondentMetadata,
  conversation,
  form,
} from "@convoform/db/src/schema";
import { createConversationLogger } from "@convoform/logger";

import type { ActionContext } from "../../types/actionContextType";

type ConversationForLabels = Pick<
  Conversation,
  "id" | "formId" | "organizationId" | "transcript" | "formFieldResponses"
> & {
  metaData?: RespondentMetadata | null;
  isOwnerPreview?: boolean;
};

export type GenerateAndSaveLabelsResult =
  | { success: true; skipped: true; reason: string }
  | {
      success: true;
      skipped: false;
      labels: Awaited<ReturnType<typeof generateConversationLabels>>;
    };

/**
 * Generates tone, sentiment, lead temperature and (when enabled) the form's
 * custom category labels, then stores them in `metaData.labels`.
 *
 * Never throws: a failed label run must not block completion, webhooks or
 * insights.
 */
export async function generateAndSaveLabels(
  conversationData: ConversationForLabels,
  ctx: ActionContext,
): Promise<GenerateAndSaveLabelsResult> {
  const logger = createConversationLogger({
    conversationId: conversationData.id,
    formId: conversationData.formId,
    organizationId: conversationData.organizationId,
  });

  if (conversationData.isOwnerPreview) {
    logger.info("labels:skipped", { reason: "owner_preview" });
    return { success: true, skipped: true, reason: "owner_preview" };
  }

  if (!conversationData.transcript?.length) {
    logger.info("labels:skipped", { reason: "empty_transcript" });
    return { success: true, skipped: true, reason: "empty_transcript" };
  }

  if (conversationData.metaData?.labels?.generatedAt) {
    logger.info("labels:skipped", { reason: "labels_already_exist" });
    return { success: true, skipped: true, reason: "labels_already_exist" };
  }

  try {
    const formData = await ctx.db.query.form.findFirst({
      where: eq(form.id, conversationData.formId),
      columns: {
        name: true,
        overview: true,
        labelSettings: true,
      },
    });

    const categorySettings = formData?.labelSettings;
    const categories =
      categorySettings?.categoriesEnabled === true
        ? categorySettings.categories
        : [];

    const labels = await generateConversationLabels(
      {
        transcript: conversationData.transcript,
        formFieldResponses: conversationData.formFieldResponses,
        formName: formData?.name,
        formOverview: formData?.overview,
        categories,
        metadata: {
          conversationId: conversationData.id,
          formId: conversationData.formId,
          organizationId: conversationData.organizationId,
        },
      },
      {},
    );

    if (!hasAnyLabel(labels)) {
      logger.info("labels:skipped", { reason: "no_labels" });
      return { success: true, skipped: true, reason: "no_labels" };
    }

    const [updatedConversation] = await ctx.db
      .update(conversation)
      .set({
        metaData: sql`jsonb_set(coalesce(${conversation.metaData}, '{}'::jsonb), '{labels}', ${JSON.stringify(labels)}::jsonb)`,
      })
      .where(eq(conversation.id, conversationData.id))
      .returning({ id: conversation.id });

    if (!updatedConversation) {
      throw new Error("Failed to update conversation with labels");
    }

    logger.info("labels:saved", {
      tone: labels.tone ? "yes" : "no",
      sentiment: labels.sentiment ? "yes" : "no",
      temperature: labels.temperature?.value,
      categoryCount: labels.categories?.length ?? 0,
    });

    return { success: true, skipped: false, labels };
  } catch (error) {
    // Completion must continue even when labelling fails.
    logger.error("labels:failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return { success: true, skipped: true, reason: "failed" };
  }
}

function hasAnyLabel(
  labels: Awaited<ReturnType<typeof generateConversationLabels>>,
) {
  return Boolean(
    labels.tone ||
      labels.sentiment ||
      labels.temperature ||
      labels.categories?.length,
  );
}
