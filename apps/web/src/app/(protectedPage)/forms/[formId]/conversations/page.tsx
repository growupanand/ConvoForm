import { AllConversationsTable } from "./_components/allConversationsTable";
import { OverviewDataCard } from "./_components/overviewDataCard";

type Props = {
  params: { formId: string };
};

export default function ConversationPage({
  params: { formId },
}: Readonly<Props>) {
  return (
    <>
      <h2 className="mb-5 font-medium capitalize text-2xl transition-all-conversation-heading">
        All conversations
      </h2>
      <div className="mb-10">
        <OverviewDataCard formId={formId} />
      </div>
      <div className="col-auto">
        <AllConversationsTable formId={formId} />
      </div>
    </>
  );
}
