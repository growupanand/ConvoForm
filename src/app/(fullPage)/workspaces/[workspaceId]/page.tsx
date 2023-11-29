import CreateFormButton from "@/components/dashboard/workspaces/createFormButton";
import FormList from "@/components/dashboard/workspaces/formList";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { User, Workspace } from "@prisma/client";
import { notFound } from "next/navigation";

interface WorkspacePageProps {
  params: { workspaceId: string };
}

async function getWorkspaceForUser(
  workspaceId: Workspace["id"],
  userId: User["id"]
) {
  return await db.workspace.findFirst({
    where: {
      id: workspaceId,
      userId: userId,
    },
    include: {
      Form: true,
    },
  });
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = params;
  const user = await getCurrentUser();
  const workspace = await getWorkspaceForUser(workspaceId, user.id);
  if (!workspace) {
    notFound();
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <CreateFormButton workspace={workspace} />
      </div>
      <div className="mt-4">
        <FormList workspaceId={workspace.id} />
      </div>
    </div>
  );
}
