import type { Conversation } from "../../../db/src/schema";
import { API_DOMAIN } from "../constants";

export const patchConversation = async (
  formId: string,
  conversationId: string,
  data: Partial<Conversation>,
  apiDomain?: string,
) => {
  await fetch(`${apiDomain ?? API_DOMAIN}/api/form/${formId}/conversations`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      id: conversationId,
    }),
  });
};
