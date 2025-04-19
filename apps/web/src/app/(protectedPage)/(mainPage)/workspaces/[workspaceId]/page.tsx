import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getOrganizationId } from "@/lib/getOrganizationId";
import { api } from "@/trpc/server";
import { PageShell } from "../../_components/pageShell";
import CreateFormButton from "./_component/createFormButton";
import { FormList } from "./_component/formList";
import ImportGoogleFormButton from "./_component/importGoogleFormButton";
import { WorkspaceHeader } from "./_component/pageHeader";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

type Props = {
  params: { workspaceId: string };
};

export const metadata: Metadata = {
  title: "Workspaces",
};

export default async function WorkspacePage(props: Readonly<Props>) {
  const params = await props.params;

  const { workspaceId } = params;

  const orgId = await getOrganizationId();
  const workspace = await api.workspace.getOne({
    id: workspaceId,
    organizationId: orgId,
  });

  if (!workspace) {
    notFound();
  }

  return (
    <PageShell
      title={<WorkspaceHeader workspace={workspace} />}
      actionButtonBottom={
        <div className="flex items-center gap-2">
          <CreateFormButton workspace={workspace} />
          <ImportGoogleFormButton />
        </div>
      }
    >
      <FormList workspace={workspace} />
    </PageShell>
  );
}
