import { analytics } from "@convoform/analytics";
import { eq } from "@convoform/db";
import { type PatchConversation, conversation } from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";

export async function patchConversation(
  input: PatchConversation,
  ctx: ActionContext,
) {
  const {
    id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...updatedData
  } = input;
  const [updatedConversation] = await ctx.db
    .update(conversation)
    .set({
      ...updatedData,
    })
    .where(eq(conversation.id, id))
    .returning();

  if (!updatedConversation) {
    throw new Error("Failed to update conversation");
  }

  analytics.track("conversation:update", {
    properties: input,
  });
}
