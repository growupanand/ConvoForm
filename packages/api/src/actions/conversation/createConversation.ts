import { analytics } from "@convoform/analytics";
import {
  conversation,
  insertConversationSchema,
  restoreDateFields,
} from "@convoform/db/src/schema";
import type { z } from "zod/v4";
import type { ActionContext } from "../../types/actionContextType";
import { buildConversationAnalyticsTrackPayload } from "./conversationAnalytics";

export async function createConversation(
  input: z.infer<typeof insertConversationSchema>,
  ctx: ActionContext,
) {
  const { transcript, formFieldResponses, formOverview, ...newConversation } =
    insertConversationSchema.parse(input);

  const [result] = await ctx.db
    .insert(conversation)
    .values({
      ...newConversation,
      // A new conversation is active until it is completed or abandoned.
      // The websocket started/stopped events own this flag after creation,
      // so the stream snapshots must not start from a stale `false`.
      isInProgress: !newConversation.finishedAt,
      transcript,
      formOverview,
      formFieldResponses,
      updatedAt: new Date(),
    })
    .returning();

  if (!result) {
    throw new Error("Failed to create conversation");
  }

  await analytics.track(
    "conversation:create",
    buildConversationAnalyticsTrackPayload(result),
  );

  const parsedFormFieldResponses = formFieldResponses.map((collection) => {
    if (collection.fieldConfiguration === undefined) {
      return collection;
    }

    return {
      ...collection,
      fieldConfiguration: restoreDateFields(collection.fieldConfiguration),
    };
  });

  return {
    ...result,
    formFieldResponses: parsedFormFieldResponses,
  };
}
