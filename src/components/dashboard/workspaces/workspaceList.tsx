"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Workspace } from "@prisma/client";
import { useEffect, useState } from "react";
import { WorkspaceListItem } from "./workspaceListItem";

type Props = {
  workspaces: Workspace[];
  isLoading: boolean;
  onWorkspaceDelete: (workspace: Workspace) => void;
};

export default function WorkspacesList({
  workspaces,
  isLoading,
  onWorkspaceDelete,
}: Props) {
  const emptyWorkspaces = workspaces.length === 0;

  return (
    <div className="grid divide-y divide-border rounded-md border">
      {isLoading && (
        <>
          <WorkspacesListSkeleton />
          <WorkspacesListSkeleton />
          <WorkspacesListSkeleton />
        </>
      )}
      {!isLoading && emptyWorkspaces && (
        <div className="p-3 flex justify-between items-center">
          <span className="text-muted-foreground">No workspaces</span>
        </div>
      )}
      {workspaces.map((workspace) => (
        <WorkspaceListItem
          key={workspace.id}
          workspace={workspace}
          onDeleted={onWorkspaceDelete}
        />
      ))}
    </div>
  );
}

const WorkspacesListSkeleton = () => (
  <div className="p-3 flex justify-between items-center ">
    <Skeleton className=" w-[130px] h-[20px] rounded-full" />
    <Skeleton className=" w-[30px] h-[30px] " />
  </div>
);
