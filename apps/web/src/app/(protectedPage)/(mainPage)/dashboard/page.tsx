import type { Metadata } from "next";

import { ResponseDataCard } from "@/app/(protectedPage)/(mainPage)/dashboard/_components/reponseDataCard";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { PageShell } from "../_components/pageShell";
import { RecentResponsesCard } from "./_components/recentResponseCard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const orgId = getOrganizationId();

  return (
    <PageShell title="Dashboard">
      <div className="grid gap-10 grid-cols-8">
        <div className=" col-span-5">
          <div className="grid space-y-10">
            <ResponseDataCard orgId={orgId} />
          </div>
        </div>
        <div className="col-span-3">
          <RecentResponsesCard take={10} />
        </div>
      </div>
    </PageShell>
  );
}
