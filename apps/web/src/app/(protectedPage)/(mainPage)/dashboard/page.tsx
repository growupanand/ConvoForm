import { Metadata } from "next";

import { ResponseDataCard } from "@/app/(protectedPage)/(mainPage)/dashboard/_components/reponseDataCard";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { RecentResponsesList } from "./_components/recentResponseList";
import { ResponseUsageCard } from "./_components/responseUsageCard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const orgId = getOrganizationId();

  return (
    <div className="">
      <h1 className="mb-5 py-3 text-xl font-medium lg:text-2xl">Dashboard</h1>
      <div className="grid gap-5 lg:grid-cols-6">
        <div className="max-lg:mb-5 lg:col-span-2">
          <div className="grid gap-3">
            <ResponseDataCard orgId={orgId} />
            <ResponseUsageCard organizationId={orgId} />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-normal">
              Recent responses
            </h3>
            <div>
              <RecentResponsesList take={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
