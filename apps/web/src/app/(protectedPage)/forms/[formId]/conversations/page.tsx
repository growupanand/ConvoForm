import { ConversationsStats } from "@/components/conversationsStats";
import { MultiChoiceStats } from "@/components/statsComponents/answersStatsComponents/multiChoiceStats";
import { RatingStats } from "@/components/statsComponents/answersStatsComponents/ratingStats";
import { ChartColumnIncreasing } from "lucide-react";

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function ConversationsStatsPage(props: Readonly<Props>) {
  const params = await props.params;

  const { formId } = params;

  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl ">
        <ChartColumnIncreasing className="mr-2 size-6 inline" />
        <span className="transition-all-conversation-heading">Responses</span>{" "}
        <span>Analytics</span>
      </h2>
      <div className="space-y-20">
        <ConversationsStats formId={formId} showExtendedStats />
        <MultiChoiceStats formId={formId} />
        <RatingStats formId={formId} />
      </div>
    </div>
  );
}
