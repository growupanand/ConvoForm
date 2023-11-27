"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/fetch";
import { Workspace } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

type Props = {
  workspace: Workspace;
  onDeleted: (workspace: Workspace) => void;
};

type State = {
  isDeleting: boolean;
};

export function WorkspaceListItem({ workspace, onDeleted }: Props) {
  const [state, setState] = useState<State>({ isDeleting: false });
  const { isDeleting } = state;
  const createdAt = new Date(workspace.createdAt);
  const formatedCreatedAt = formatDate(createdAt.toDateString());

  const deleteWorkspace = async (id: string) => {
    setState((cs) => ({ ...cs, isDeleting: true }));
    try {
      await apiClient(`/api/workspaces/${workspace.id}`, {
        method: "DELETE",
      });
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                <Check className="text-white " />
              </div>
              <span>Workspace deleted</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
      onDeleted(workspace);
    } catch (error) {
      toast({
        title: "Unable to delete workspace",
        duration: 1500,
        action: (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Retry"
            )}
          </Button>
        ),
      });
    } finally {
      setState((cs) => ({ ...cs, isDeleting: false }));
    }
  };

  return (
    <div className="p-3 flex justify-between items-center">
      <div className="grid gap-1">
        <div>{workspace.name}</div>
        <p className="text-muted-foreground text-xs">{formatedCreatedAt}</p>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isDeleting}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => deleteWorkspace(workspace.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
