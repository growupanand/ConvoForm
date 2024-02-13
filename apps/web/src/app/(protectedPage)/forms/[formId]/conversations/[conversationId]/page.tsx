import { notFound } from "next/navigation";

import ConversationDetail from "@/app/(protectedPage)/forms/[formId]/conversations/_components/conversationDetail";
import { api } from "@/trpc/server";

type Props = {
  params: { conversationId: string };
};

export default async function ConversationDetailPage(props: Props) {
  const { conversationId } = props.params;

  const conversation = await api.conversation.getOne({
    id: conversationId,
  });

  if (!conversation) {
    notFound();
  }

  return <ConversationDetail conversation={conversation} />;
}
