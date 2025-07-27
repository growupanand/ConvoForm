import type { Metadata } from "next";

import { getOrganizationIdOrRedirect } from "@/lib/getOrganizationId";
import { PageShell } from "../_components/pageShell";
import CreateFormButton from "./_components/createFormButton";
import { FormList } from "./_components/formList";
import ImportGoogleFormButton from "./_components/importGoogleFormButton";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Forms",
};

export default async function FormsPage() {
  const organizationId = await getOrganizationIdOrRedirect();

  return (
    <PageShell
      title="Forms"
      actionButtonBottom={
        <div className="flex items-center gap-2">
          <CreateFormButton organizationId={organizationId} />
          <ImportGoogleFormButton organizationId={organizationId} />
        </div>
      }
    >
      <FormList organizationId={organizationId} />
    </PageShell>
  );
}
