import { analytics } from "@convoform/analytics";
import { eq, sql } from "@convoform/db";
import { conversation } from "@convoform/db/src/schema";
import { createConversationLogger } from "@convoform/logger";

import { generateConversationInsights } from "../../lib/ai";
import type { ActionContext } from "../../types/actionContextType";
import {
  type ConversationForInsights,
  type InsightsTrigger,
  shouldSkipInsightsGeneration,
} from "./conversationInsightsDecision";

export type { InsightsTrigger } from "./conversationInsightsDecision";
export {
  conversationHasAnsweredField,
  countUserTranscriptMessages,
  resolveWebsocketInsightsDecision,
  shouldGenerateAbandonedInsights,
  shouldSkipInsightsGeneration,
} from "./conversationInsightsDecision";

export async function generateAndSaveInsights(
  conversationData: ConversationForInsights,
  ctx: ActionContext,
  options: {
    trigger: InsightsTrigger;
    isPartial: boolean;
    completionStatus: "completed" | "abandoned";
  },
) {
  const logger = createConversationLogger({
    conversationId: conversationData.id,
  });

  const skipReason = shouldSkipInsightsGeneration({
    metaData: conversationData.metaData,
    finishedAt: conversationData.finishedAt,
    trigger: options.trigger,
  });

  if (skipReason) {
    logger.info("insights:skipped", {
      reason: skipReason,
      trigger: options.trigger,
    });
    return {
      success: true as const,
      skipped: true as const,
      reason: skipReason,
    };
  }

  if (!conversationData.transcript?.length) {
    logger.info("insights:skipped", {
      reason: "empty_transcript",
      trigger: options.trigger,
    });
    return {
      success: true as const,
      skipped: true as const,
      reason: "empty_transcript",
    };
  }

  logger.info("insights:start", { trigger: options.trigger });

  try {
    const insightsCore = await generateConversationInsights(
      conversationData.transcript,
      conversationData.formFieldResponses,
      {
        conversationId: conversationData.id,
        formId: conversationData.formId,
        organizationId: conversationData.organizationId,
      },
      { isPartial: options.isPartial },
    );

    const insights = {
      ...insightsCore,
      isPartial: options.isPartial,
      completionStatus: options.completionStatus,
    };

    const [updatedConversation] = await ctx.db
      .update(conversation)
      .set({
        metaData: sql`jsonb_set(coalesce(${conversation.metaData}, '{}'::jsonb), '{insights}', ${JSON.stringify(insights)}::jsonb)`,
      })
      .where(eq(conversation.id, conversationData.id))
      .returning();

    if (!updatedConversation) {
      throw new Error("Failed to update conversation with insights");
    }

    logger.info("insights:saved", { trigger: options.trigger });

    return { success: true as const, skipped: false as const, insights };
  } catch (error) {
    logger.error("insights:failed", {
      trigger: options.trigger,
      error: error instanceof Error ? error.message : String(error),
    });
    analytics.captureException(error as Error);
    throw error;
  }
}
