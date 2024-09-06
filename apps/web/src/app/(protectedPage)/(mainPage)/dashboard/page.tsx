import type { Metadata } from "next";

import { ResponseDataCard } from "@/app/(protectedPage)/(mainPage)/dashboard/_components/reponseDataCard";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { PageShell } from "../_components/pageShell";
import { RecentResponsesCard } from "./_components/recentResponseCard";
import { ResponseUsageCard } from "./_components/responseUsageCard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const orgId = getOrganizationId();

  return (
    <PageShell title="Dashboard">
      <div className="grid gap-5 grid-cols-6">
        <div className=" col-span-2">
          <div className="grid gap-5">
            <ResponseDataCard orgId={orgId} />
            <ResponseUsageCard organizationId={orgId} />
          </div>
        </div>
        <div className="col-span-4">
          <RecentResponsesCard take={10} />
        </div>
      </div>
    </PageShell>
  );
}
