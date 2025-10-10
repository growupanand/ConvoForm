import { eq } from "@convoform/db";
import { conversation, restoreDateFields } from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";

export async function getOneConversation(
  conversationId: string,
  ctx: ActionContext,
) {
  const existConversation = await ctx.db.query.conversation.findFirst({
    where: eq(conversation.id, conversationId),
  });

  if (!existConversation) {
    return undefined;
  }

  const formFieldResponses = existConversation.formFieldResponses.map(
    (collection) => {
      if (collection.fieldConfiguration === undefined) {
        return collection;
      }

      return {
        ...collection,
        fieldConfiguration: restoreDateFields(collection.fieldConfiguration),
      };
    },
  );

  return {
    ...existConversation,
    formFieldResponses,
  };
}
