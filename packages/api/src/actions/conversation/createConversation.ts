import { analytics } from "@convoform/analytics";
import {
  conversation,
  insertConversationSchema,
  restoreDateFields,
} from "@convoform/db/src/schema";
import type { z } from "zod/v4";
import type { ActionContext } from "../../types/actionContextType";

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
      transcript,
      formOverview,
      formFieldResponses,
      updatedAt: new Date(),
    })
    .returning();

  if (!result) {
    throw new Error("Failed to create conversation");
  }

  analytics.track("conversation:create", {
    properties: {
      ...result,
    },
  });

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
