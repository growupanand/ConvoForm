import { AllConversationsTable } from "./_components/allConversationsTable";
import { OverviewDataCard } from "./_components/overviewDataCard";

type Props = {
  params: { formId: string };
};

export default async function ConversationPage({
  params: { formId },
}: Readonly<Props>) {
  return (
    <>
      <h2 className="mb-5 text-xl font-medium capitalize lg:text-2xl">
        All conversations
      </h2>
      <div className="mb-5 lg:mb-10">
        <OverviewDataCard formId={formId} />
      </div>
      <div className="col-auto">
        <AllConversationsTable formId={formId} />
      </div>
    </>
  );
}
