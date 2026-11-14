import type { RespondentMetadata } from "@convoform/db/src/schema";

/**
 * Client patches replace metaData wholesale and never include server-written
 * insights or labels. Preserve them when the incoming payload omits them.
 */
export function mergeConversationMetaDataForPatch(
  incoming: RespondentMetadata,
  existing: RespondentMetadata | null | undefined,
): RespondentMetadata {
  const merged = { ...incoming };

  if (incoming.insights === undefined && existing?.insights !== undefined) {
    merged.insights = existing.insights;
  }

  if (incoming.labels === undefined && existing?.labels !== undefined) {
    merged.labels = existing.labels;
  }

  return merged;
}
