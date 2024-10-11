import type { Conversation } from "@convoform/db/src/schema";
import { API_DOMAIN } from "../constants";
import { getResponseJSON } from "./utils";

export const createConversation = async (formId: string) => {
  const response = await fetch(
    `${API_DOMAIN}/api/form/${formId}/conversations`,
    {
      method: "POST",
    },
  );
  return getResponseJSON<Conversation>(response);
};

export const patchConversation = async (
  formId: string,
  conversationId: string,
  data: Partial<Conversation>,
) => {
  await fetch(`${API_DOMAIN}/api/form/${formId}/conversations`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      id: conversationId,
    }),
  });
};
