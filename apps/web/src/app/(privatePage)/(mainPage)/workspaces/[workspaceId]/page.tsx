import { Metadata } from "next";
import { notFound } from "next/navigation";

import FormList from "@/components/mainPage/workspace/formList";
import { WorkspaceHeader } from "@/components/mainPage/workspace/workspaceHeader";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

type Props = {
  params: { workspaceId: string };
};

export const metadata: Metadata = {
  title: "Workspaces",
};

export default async function WorkspacePage({
  params: { workspaceId },
}: Readonly<Props>) {
  const orgId = getOrganizationId();
  const workspace = await api.workspace.getOne({ id: workspaceId });

  if (!workspace) {
    notFound();
  }

  return (
    <div>
      <WorkspaceHeader workspace={workspace} />
      <FormList workspaceId={workspaceId} orgId={orgId} />
    </div>
  );
}
