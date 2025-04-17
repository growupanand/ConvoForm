export const isValidId = (id: unknown): id is string => {
  if (typeof id === "string" && id.trim().length > 0) {
    return true;
  }
  return false;
};

export const getConversationRoom = (conversationId: string) => {
  return `conversation:${conversationId}`;
};

export const getFormRoom = (formId: string) => {
  return `form:${formId}`;
};
