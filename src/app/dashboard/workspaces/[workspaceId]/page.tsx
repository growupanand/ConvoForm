import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { User, Workspace } from "@prisma/client";
import Link from "next/link";
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
  });
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const workspaceId = params.workspaceId;
  const user = await getCurrentUser();
  const workspace = await getWorkspaceForUser(workspaceId, user.id);
  if (!workspace) {
    notFound();
  }
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/workspaces">
            <Button variant="ghost">Back</Button>
          </Link>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
        </div>
        <Button>New form</Button>
      </div>
    </div>
  );
}
