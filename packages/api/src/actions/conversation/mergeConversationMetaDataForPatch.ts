import type { RespondentMetadata } from "@convoform/db/src/schema";

/**
 * Client patches replace metaData wholesale and never include server-written insights.
 * Preserve existing insights when the incoming payload omits them.
 */
export function mergeConversationMetaDataForPatch(
  incoming: RespondentMetadata,
  existing: RespondentMetadata | null | undefined,
): RespondentMetadata {
  if (incoming.insights !== undefined || existing?.insights === undefined) {
    return incoming;
  }

  return {
    ...incoming,
    insights: existing.insights,
  };
}
