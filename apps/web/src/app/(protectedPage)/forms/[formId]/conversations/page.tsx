import { ConversationsStats } from "@/components/conversationsStats";

type Props = {
  params: { formId: string };
};

export default function ConversationsStatsPage({
  params: { formId },
}: Readonly<Props>) {
  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl ">
        <span className="transition-all-conversation-heading">Responses</span>{" "}
        Stats
      </h2>
      <div className="grid gap-y-10">
        <ConversationsStats formId={formId} />
      </div>
    </div>
  );
}
