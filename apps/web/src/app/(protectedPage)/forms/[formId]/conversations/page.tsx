import { getOrganizationId } from "@/lib/getOrganizationId";
import { OverviewDataCard } from "./_components/overviewDataCard";
import { OverviewTable } from "./_components/overviewTable";

type Props = {
  params: { formId: string };
};

export default function ConversationPage({
  params: { formId },
}: Readonly<Props>) {
  const orgId = getOrganizationId();

  return (
    <>
      <div className="mb-3 lg:mb-5">
        <OverviewDataCard orgId={orgId} formId={formId} />
      </div>
      <div className="col-auto">
        <OverviewTable formId={formId} />
      </div>
    </>
  );
}
