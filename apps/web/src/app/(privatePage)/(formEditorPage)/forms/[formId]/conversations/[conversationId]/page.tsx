import { notFound } from "next/navigation";
import { api } from "@convoform/api/trpc/server";

import ConversationDetail from "@/components/formEditorPage/conversations/conversationDetail";

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
