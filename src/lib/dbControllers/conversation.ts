import { Form } from "@prisma/client";

import prisma from "../db";

export const getFormConversations = async (formId: Form["id"]) => {
  return await prisma.conversation.findMany({
    where: {
      formId,
    },
  });
};

export const getFormConversation = async (conversationId: string) => {
  return await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });
};
