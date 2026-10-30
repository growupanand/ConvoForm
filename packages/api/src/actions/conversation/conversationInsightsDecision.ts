import type {
  FormFieldResponses,
  RespondentMetadata,
  Transcript,
} from "@convoform/db/src/schema";

export type InsightsTrigger = "completed" | "abandoned" | "fallback";

const FINISHED_INSIGHTS_FALLBACK_DELAY_MS = 30_000;

type ConversationForInsights = {
  id: string;
  formId: string;
  organizationId: string;
  finishedAt: Date | null;
  transcript: Transcript[] | null;
  formFieldResponses: FormFieldResponses[];
  metaData: RespondentMetadata | null;
};

export function conversationHasAnsweredField(
  formFieldResponses: FormFieldResponses[],
) {
  return formFieldResponses.some(
    (field) => field.fieldValue != null && field.fieldValue !== "",
  );
}

export function countUserTranscriptMessages(transcript: Transcript[] | null) {
  return (transcript ?? []).filter((entry) => entry.role === "user").length;
}

export function shouldGenerateAbandonedInsights(
  conversation: Pick<
    ConversationForInsights,
    "formFieldResponses" | "transcript"
  >,
) {
  return (
    conversationHasAnsweredField(conversation.formFieldResponses) ||
    countUserTranscriptMessages(conversation.transcript) >= 2
  );
}

export function shouldSkipInsightsGeneration(params: {
  metaData: RespondentMetadata | null;
  finishedAt: Date | null;
  trigger: InsightsTrigger;
}) {
  const generatedAtRaw = params.metaData?.insights?.generatedAt;
  if (!generatedAtRaw) {
    return null;
  }

  const generatedAt = new Date(generatedAtRaw);

  if (params.finishedAt) {
    if (generatedAt >= params.finishedAt) {
      return "insights_already_current";
    }

    if (params.trigger === "completed" || params.trigger === "fallback") {
      return null;
    }
  }

  return "insights_already_exist";
}

export function resolveWebsocketInsightsDecision(
  conversation: ConversationForInsights,
  now = Date.now(),
):
  | { action: "skip"; reason: string }
  | {
      action: "generate";
      trigger: InsightsTrigger;
      isPartial: boolean;
      completionStatus: "completed" | "abandoned";
    } {
  if (conversation.finishedAt) {
    const skipReason = shouldSkipInsightsGeneration({
      metaData: conversation.metaData,
      finishedAt: conversation.finishedAt,
      trigger: "fallback",
    });
    if (skipReason) {
      return { action: "skip", reason: skipReason };
    }

    const ageMs = now - conversation.finishedAt.getTime();
    if (ageMs < FINISHED_INSIGHTS_FALLBACK_DELAY_MS) {
      return { action: "skip", reason: "primary_completion_pending" };
    }

    return {
      action: "generate",
      trigger: "fallback",
      isPartial: false,
      completionStatus: "completed",
    };
  }

  if (!shouldGenerateAbandonedInsights(conversation)) {
    return { action: "skip", reason: "abandoned_without_answers" };
  }

  const skipReason = shouldSkipInsightsGeneration({
    metaData: conversation.metaData,
    finishedAt: null,
    trigger: "abandoned",
  });
  if (skipReason) {
    return { action: "skip", reason: skipReason };
  }

  return {
    action: "generate",
    trigger: "abandoned",
    isPartial: true,
    completionStatus: "abandoned",
  };
}

export type { ConversationForInsights };
