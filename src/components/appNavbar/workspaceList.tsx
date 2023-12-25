"use client";

import { Workspace } from "@prisma/client";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn, timeAgo } from "@/lib/utils";
import { usePathname } from "next/navigation";
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
