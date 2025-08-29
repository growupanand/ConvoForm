import {
  type Conversation,
  selectConversationSchema,
} from "@convoform/db/src/schema";
import { API_DOMAIN } from "../../constants";
import { getResponseJSON } from "../../controllers/utils";

export const createConversationAction = async (formId: string) => {
  const response = await fetch(
    `${API_DOMAIN}/api/form/${formId}/conversations`,
    {
      method: "POST",
    },
  );
  return getResponseJSON(response, selectConversationSchema);
};

export const patchConversationAction = async (
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
