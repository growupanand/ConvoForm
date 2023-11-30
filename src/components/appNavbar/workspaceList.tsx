import { Workspace } from "@prisma/client";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { DeleteWorkspaceButton } from "./deleteWorkspaceButton";

type Props = {
  workspaces: Workspace[];
};

export const WorkspaceList = ({ workspaces }: Props) => {
  const pathname = usePathname();

  return (
    <>
      {workspaces.map((workspace) => (
        <div key={workspace.id} className="flex justify-between items-center">
          <Link href={`/workspaces/${workspace.id}`}>
            <Button
              variant="link"
              className={cn(
                "w-full justify-start hover:no-underline text-gray-500 hover:text-gray-800",
                pathname.includes(workspace.id) && "text-gray-800 font-semibold"
              )}
            >
              {workspace.name}
            </Button>
          </Link>

          <DeleteWorkspaceButton workspace={workspace} />
        </div>
      ))}
    </>
  );
};
