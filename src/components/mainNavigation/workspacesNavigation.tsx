"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Plus } from "lucide-react";

import { createWorkspace } from "@/lib/serverActions/workspace";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { toast } from "../ui/use-toast";
import { useWorkspacesContext } from "../workspacesProvider";
import NavigationLink from "./navigationLink";

type State = {
  isCreatingWorkspace: boolean;
};

export function WorkspacesNavigation() {
  const [state, setState] = useState<State>({
    isCreatingWorkspace: false,
  });
  const { isCreatingWorkspace } = state;

  const { workspaces, setWorkspaces, isLoading } = useWorkspacesContext();

  const { userId, orgId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const createNewWorkspace = async () => {
    setState((cs) => ({ ...cs, isCreatingWorkspace: true }));
    try {
      const newWorkspace = await createWorkspace(
        "New Workspace",
        userId!,
        orgId!,
      );
      toast({
        title: "Workspace created",
        duration: 1500,
      });
      setWorkspaces([...workspaces, newWorkspace]);
      router.push(`/workspaces/${newWorkspace.id}/`);
    } catch (error) {
      toast({
        title: "Unable to create workspace",
        duration: 1500,
        variant: "destructive",
      });
    } finally {
      setState((cs) => ({ ...cs, isCreatingWorkspace: false }));
    }
  };

  return (
    <div className="truncate">
      <div className="flex items-center justify-between ">
        <span className="ps-4 text-sm font-medium text-muted-foreground">
          Workspaces
        </span>
        <Button
          variant="link"
          className="pe-0 hover:no-underline"
          disabled={isCreatingWorkspace || isLoading}
          onClick={createNewWorkspace}
        >
          {isCreatingWorkspace ? (
            <Loader2 className=" h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </Button>
      </div>
      {isLoading ? (
        <WorkspaceListLoading />
      ) : (
        <>
          {workspaces.length === 0 && (
            <div className="items-center] flex justify-between px-3">
              <span className="p-2 text-sm text-muted-foreground">
                No workspaces
              </span>
            </div>
          )}
          <ScrollArea className="h-96">
            <div className="grid">
              {workspaces.map((workspace) => (
                <NavigationLink
                  key={workspace.id}
                  isActive={pathname.includes(workspace.id)}
                  href={`/workspaces/${workspace.id}`}
                  name={workspace.name}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

const WorkspaceListLoading = () => {
  return (
    <div className="grid gap-2">
      <div className="items-center] flex justify-between px-3">
        <Skeleton className="h-[15px] w-[100px] rounded-full bg-gray-400" />
        <Skeleton className="h-[15px] w-[20px] bg-gray-400 " />
      </div>
      <div className="items-center] flex justify-between px-3">
        <Skeleton className="h-[15px] w-[100px] rounded-full bg-gray-400" />
        <Skeleton className="h-[15px] w-[20px] bg-gray-400 " />
      </div>
    </div>
  );
};
