import type { Metadata } from "next";

import { ConversationsStatsCard } from "@/components/conversationsStatsCard";
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
      <div className="grid gap-10 grid-cols-10">
        <div className="col-span-7 ">
          <ConversationsStatsCard key={orgId} />
        </div>
        <div className="col-span-3">
          <RecentResponsesCard key={orgId} take={10} />
        </div>
      </div>
    </PageShell>
  );
}
