import type { Metadata } from "next";

import { getOrgIdOrRedirect } from "@/lib/getOrganizationId";
import { Suspense } from "react";
import { PageShell } from "../_components/pageShell";
import CreateFormButton from "./_components/createFormButton";
import { FormList } from "./_components/formList";
import FormListLoading from "./_components/formListLoading";
import ImportGoogleFormButton from "./_components/importGoogleFormButton";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Forms",
};

export default async function FormsPage() {
  const organizationId = await getOrgIdOrRedirect();

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
      <Suspense fallback={<FormListLoading />}>
        <FormList organizationId={organizationId} />
      </Suspense>
    </PageShell>
  );
}
