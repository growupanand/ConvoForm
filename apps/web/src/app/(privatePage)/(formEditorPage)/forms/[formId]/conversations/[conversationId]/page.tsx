import { notFound } from "next/navigation";

import ConversationDetail from "@/components/formEditorPage/conversations/conversationDetail";
import { api } from "@/trpc/server";

type Props = {
  params: { conversationId: string };
};

export default async function ConversationDetailPage(props: Props) {
  const { conversationId } = props.params;

  const conversation = await api.conversation.getOne.query({
    id: conversationId,
  });

  if (!conversation) {
    notFound();
  }

  return <ConversationDetail conversation={conversation} />;
}
