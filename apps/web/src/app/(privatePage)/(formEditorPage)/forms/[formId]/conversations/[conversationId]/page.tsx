import { notFound } from "next/navigation";

import ConversationDetail from "@/components/formEditorPage/conversations/conversationDetail";
import { getFormConversationController } from "@/lib/controllers/form";

type Props = {
  params: { conversationId: string };
};

export default async function ConversationDetailPage(props: Props) {
  const { conversationId } = props.params;

  const conversation = await getFormConversationController(conversationId);

  if (!conversation) {
    notFound();
  }

  return <ConversationDetail conversation={conversation} />;
}
