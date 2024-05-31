import { Metadata } from "next";

import { ResponseDataCard } from "@/app/(protectedPage)/(mainPage)/dashboard/_components/reponseDataCard";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { RecentResponsesCard } from "./_components/recentResponseCard";
import { ResponseUsageCard } from "./_components/responseUsageCard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const orgId = getOrganizationId();

  return (
    <div className="pb-5">
      <h1 className="mb-5 py-3 text-xl font-medium lg:text-2xl">Dashboard</h1>
      <div className="grid gap-5 lg:grid-cols-6">
        <div className="max-lg:mb-5 lg:col-span-2">
          <div className="grid gap-5">
            <ResponseDataCard orgId={orgId} />
            <ResponseUsageCard organizationId={orgId} />
          </div>
        </div>
        <div className="lg:col-span-4">
          <RecentResponsesCard take={10} />
        </div>
      </div>
    </div>
  );
}
