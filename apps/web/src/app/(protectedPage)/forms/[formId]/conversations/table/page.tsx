import { Table } from "lucide-react";
import { AllConversationsTable } from "../_components/allConversationsTable";

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function ConversationsTablePage(props: Readonly<Props>) {
  const params = await props.params;

  const { formId } = params;

  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl ">
        <Table className="mr-2 size-6 inline" />
        <span className="transition-all-conversation-heading">Responses</span>{" "}
        <span>Table</span>
      </h2>
      <div className="grid gap-y-10">
        <AllConversationsTable formId={formId} />
      </div>
    </div>
  );
}
