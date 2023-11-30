"use client";

import { Check, Loader2, MoreVertical } from "lucide-react";
import CreateFormButton from "./createFormButton";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { Workspace } from "@prisma/client";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

type Props = {
  workspace: Workspace;
};

type State = {
  isDeleting: boolean;
};

export const WorkspaceHeader = ({ workspace }: Props) => {
  const [state, setState] = useState<State>({
    isDeleting: false,
  });
  const { isDeleting } = state;

  const workspaceStore = useWorkspaceStore();
  const { workspaces } = workspaceStore;

  const router = useRouter();

  const deleteWorkspace = async () => {
    setState((cs) => ({ ...cs, isDeleting: true }));
    try {
      await workspaceStore.deleteWorkspace(workspace.id);
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
      if (workspaces.filter((i) => i.id !== workspace.id).length > 0) {
        router.push(`/workspaces/${workspaces[0].id}`);
      } else {
        router.push("/dashboard");
      }
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
            onClick={deleteWorkspace}
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
    <div className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isDeleting} asChild>
            <Button
              variant="ghost"
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
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={deleteWorkspace}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CreateFormButton workspace={workspace} />
    </div>
  );
};
