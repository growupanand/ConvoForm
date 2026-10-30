import { createConversationLogger } from "@convoform/logger";

import type { ActionContext } from "../../types/actionContextType";
import {
  generateAndSaveInsights,
  resolveWebsocketInsightsDecision,
} from "./generateAndSaveInsights";

export async function handleWebsocketConversationStoppedInsights(
  conversationId: string,
  ctx: ActionContext,
) {
  const conversationData = await ctx.db.query.conversation.findFirst({
    where: (conversation, { eq }) => eq(conversation.id, conversationId),
  });

  if (!conversationData) {
    throw new Error(`Conversation with ID ${conversationId} not found`);
  }

  const decision = resolveWebsocketInsightsDecision({
    id: conversationData.id,
    formId: conversationData.formId,
    organizationId: conversationData.organizationId,
    finishedAt: conversationData.finishedAt,
    transcript: conversationData.transcript,
    formFieldResponses: conversationData.formFieldResponses,
    metaData: conversationData.metaData,
  });

  if (decision.action === "skip") {
    createConversationLogger({ conversationId }).info("insights:skipped", {
      reason: decision.reason,
      trigger: "websocket",
    });
    return { success: true, skipped: true, reason: decision.reason };
  }

  return await generateAndSaveInsights(
    {
      id: conversationData.id,
      formId: conversationData.formId,
      organizationId: conversationData.organizationId,
      finishedAt: conversationData.finishedAt,
      transcript: conversationData.transcript,
      formFieldResponses: conversationData.formFieldResponses,
      metaData: conversationData.metaData,
    },
    ctx,
    {
      trigger: decision.trigger,
      isPartial: decision.isPartial,
      completionStatus: decision.completionStatus,
    },
  );
}
