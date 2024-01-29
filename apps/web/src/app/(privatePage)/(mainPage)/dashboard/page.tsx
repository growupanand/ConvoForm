import { Metadata } from "next";

import { FormDataCard } from "@/components/mainPage/dashboard/formDataCard";
import { ResponseDataCard } from "@/components/mainPage/dashboard/reponseDataCard";
import { getOrganizationId } from "@/lib/getOrganizationId";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const orgId = getOrganizationId();

  return (
    <div className="max-lg:p-3">
      <h1 className="mb-5 py-3 text-xl font-medium lg:text-2xl">Dashboard</h1>
      <div className="grid gap-3 lg:grid-flow-col">
        <FormDataCard orgId={orgId} />
        <ResponseDataCard orgId={orgId} />
      </div>
    </div>
  );
}
