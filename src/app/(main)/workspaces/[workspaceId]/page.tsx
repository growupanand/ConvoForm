import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs";

import FormList from "@/components/formList";
import { WorkspaceHeader } from "@/components/workspaceHeader";
import { getWorkspace } from "@/lib/serverActions/workspace";

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
  const { orgId } = auth();
  const workspace = await getWorkspace(workspaceId, orgId!);

  if (!workspace) {
    notFound();
  }

  return (
    <div>
      <WorkspaceHeader workspace={workspace} />
      <FormList />
    </div>
  );
}
