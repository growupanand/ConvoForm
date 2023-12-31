import ConversationDetail from "@/components/formEditor/conversationDetail";
import { getFormConversation } from "@/lib/dbControllers/conversation";

type Props = {
  params: { conversationId: string };
};

export default async function ConversationDetailPage(props: Props) {
  const { conversationId } = props.params;

  const conversation = await getFormConversation(conversationId);

  if (!conversation) {
    return <div>conversation not found</div>;
  }

  return <ConversationDetail conversation={conversation} />;
}
