"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Workspace } from "@prisma/client";
import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";

type State = {
  isLoading: boolean;
  workspaces: Workspace[];
};

export default function WorkspacesList() {
  const [state, setState] = useState<State>({
    isLoading: true,
    workspaces: [],
  });
  const { isLoading, workspaces } = state;
  const emptyWorkspaces = workspaces.length === 0;

  const fetchWorkspaces = async () => {
    setState((cs) => ({ ...cs, isLoading: true, workspaces: [] }));
    try {
      const res = await fetch("/api/workspaces");
      const workspaces = await res.json();
      setState((cs) => ({ ...cs, workspaces }));
    } catch (err) {
      console.error(err);
    } finally {
      setState((cs) => ({ ...cs, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <div className="grid divide-y divide-border rounded-md border">
      {isLoading && (
        <div className="p-3 flex justify-between items-center ">
          <Skeleton className=" w-[130px] h-[20px] rounded-full" />
          <Skeleton className=" w-[30px] h-[30px] " />
        </div>
      )}
      {!isLoading && emptyWorkspaces && (
        <div className="p-3 flex justify-between items-center">
          <span className="text-muted-foreground">No workspaces</span>
        </div>
      )}
      {workspaces.map((workspace) => (
        <div
          key={workspace.id}
          className="p-3 flex justify-between items-center"
        >
          <span> {workspace.name}</span>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="" align="end">
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
