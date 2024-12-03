import { AllConversationsTable } from "./_components/allConversationsTable";

type Props = {
  params: { formId: string };
};

export default function ConversationPage({
  params: { formId },
}: Readonly<Props>) {
  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl transition-all-conversation-heading">
        All responses
      </h2>
      <AllConversationsTable formId={formId} />
    </div>
  );
}
