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
      <h2 className="mb-5 text-xl font-medium capitalize lg:text-2xl">
        All conversations
      </h2>
      <div className="mb-3 lg:mb-5">
        <OverviewDataCard formId={formId} />
      </div>
      <div className="col-auto">
        <AllConversationsTable formId={formId} />
      </div>
    </>
  );
}
