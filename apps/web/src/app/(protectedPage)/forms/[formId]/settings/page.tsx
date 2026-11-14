import { SlidersHorizontal } from "lucide-react";
import { ResponseLabelsSettings } from "./_components/responseLabelsSettings";
import { SmartFollowUpsSettings } from "./_components/smartFollowUpsSettings";

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function GeneralSettingsPage(props: Props) {
  const params = await props.params;
  const { formId } = params;

  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl">
        <SlidersHorizontal className="mr-2 inline size-6 text-slate-600" />
        <span>General</span>
      </h2>
      <div className="space-y-4">
        <SmartFollowUpsSettings formId={formId} />
        <ResponseLabelsSettings formId={formId} />
      </div>
    </div>
  );
}
