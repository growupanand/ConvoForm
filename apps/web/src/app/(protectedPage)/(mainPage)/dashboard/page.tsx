import type { Metadata } from "next";

import { ConversationsStats } from "@/components/conversationsStats";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { PageShell } from "../_components/pageShell";
import { RecentResponsesCard } from "./_components/recentResponseCard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const orgId = await getOrganizationId();

  return (
    <PageShell title="Dashboard">
      <div className="grid gap-10 grid-cols-10">
        <div className="col-span-7 ">
          <ConversationsStats key={orgId} />
        </div>
        <div className="col-span-3">
          <RecentResponsesCard key={orgId} take={10} />
        </div>
      </div>
    </PageShell>
  );
}
