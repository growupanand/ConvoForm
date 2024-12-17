import { AllConversationsTable } from "../_components/allConversationsTable";

type Props = {
  params: { formId: string };
};

export default function ConversationsTablePage({
  params: { formId },
}: Readonly<Props>) {
  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl ">
        <span className="transition-all-conversation-heading">Responses</span>{" "}
        Table
      </h2>
      <div className="grid gap-y-10">
        <AllConversationsTable formId={formId} />
      </div>
    </div>
  );
}
