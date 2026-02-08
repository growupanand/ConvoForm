import { eq } from "@convoform/db";
import { conversation, form, user } from "@convoform/db/src/schema";
import { sendFormResponseEmail } from "../../lib/emails";
import type { ActionContext } from "../../types/actionContextType";

export async function sendResponseEmail(
  conversationId: string,
  ctx: ActionContext,
) {
  const conversationData = await ctx.db.query.conversation.findFirst({
    where: eq(conversation.id, conversationId),
    with: {
      form: true,
    },
  });

  if (!conversationData || !conversationData.form) {
    console.warn(`Conversation or Form not found for ID: ${conversationId}`);
    return;
  }

  // Fetch the form owner
  const owner = await ctx.db.query.user.findFirst({
    where: eq(user.userId, conversationData.form.userId),
  });

  if (!owner || !owner.email) {
    console.warn(`Owner or owner email not found for form: ${conversationData.form.id}`);
    return;
  }

  const responses = conversationData.formFieldResponses
    .map((r) => ({
      fieldName: r.fieldName,
      fieldValue: r.fieldValue,
    }))
    .filter((r) => r.fieldValue !== null);

  if (responses.length === 0) {
    console.info(`No responses found for conversation: ${conversationId}. Skipping email.`);
    return;
  }

  const tldr = conversationData.metaData?.insights?.tldr;

  await sendFormResponseEmail({
    to: owner.email,
    formName: conversationData.form.name,
    conversationName: conversationData.name,
    responses,
    tldr,
  });
}
