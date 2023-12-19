import { Form } from "@prisma/client";
import { db } from "../db";

export const getFormConversations = async (formId: Form["id"]) => {
  return await db.conversation.findMany({
    where: {
      formId,
    },
  });
};

export const getFormConversation = async (conversationId: string) => {
  return await db.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });
};
