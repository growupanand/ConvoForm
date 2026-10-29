import type { RespondentMetadata } from "@convoform/db/src/schema";

type ConversationAnalyticsSource = {
  id: string;
  formId: string;
  organizationId: string;
  name?: string;
  isInProgress?: boolean;
  finishedAt?: Date | null;
  metaData?: RespondentMetadata | null;
  formFieldResponses?: Array<{ fieldValue: string | null }>;
  transcript?: unknown[];
};

export function getConversationRespondentDistinctId(conversationId: string) {
  return conversationId;
}

export function buildConversationAnalyticsTrackPayload(
  conversation: ConversationAnalyticsSource,
) {
  const formFieldResponses = conversation.formFieldResponses ?? [];
  const answeredFieldsCount = formFieldResponses.filter(
    (field) => field.fieldValue != null && field.fieldValue !== "",
  ).length;

  return {
    distinctId: getConversationRespondentDistinctId(conversation.id),
    groups: {
      organization: conversation.organizationId,
    } as const,
    properties: {
      conversationId: conversation.id,
      formId: conversation.formId,
      organizationId: conversation.organizationId,
      name: conversation.name,
      isInProgress: conversation.isInProgress,
      finishedAt: conversation.finishedAt,
      answeredFieldsCount,
      totalFields: formFieldResponses.length,
      transcriptMessageCount: conversation.transcript?.length ?? 0,
      isOwnerPreview: conversation.metaData?.isOwnerPreview === true,
    },
  };
}
