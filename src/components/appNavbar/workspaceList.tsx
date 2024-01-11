"use client";

import { usePathname } from "next/navigation";
import { Workspace } from "@prisma/client";

import AppNavBarLink from "./appNavBarLink";

type Props = {
  workspaces: Workspace[];
};

export const WorkspaceList = ({ workspaces }: Props) => {
  const pathname = usePathname();

  return (
    <div className="grid">
      {workspaces.map((workspace) => (
        <AppNavBarLink
          key={workspace.id}
          isActive={pathname.includes(workspace.id)}
          href={`/workspaces/${workspace.id}`}
          name={workspace.name}
        />
      ))}
    </div>
  );
};
