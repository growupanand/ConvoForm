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
import { Input } from "./ui/input";
import { cn, debounce } from "@/lib/utils";

type Props = {
  workspace: Workspace;
};

type State = {
  isDeleting: boolean;
  isUpdating: boolean;
};

export const WorkspaceHeader = (props: Props) => {
  const [state, setState] = useState<State>({
    isDeleting: false,
    isUpdating: false,
  });
  const { isDeleting, isUpdating } = state;

  const workspaceStore = useWorkspaceStore();
  const { workspaces } = workspaceStore;
  const workspace = workspaces.find((i) => i.id === props.workspace.id);

  const router = useRouter();

  if (!workspace) {
    return null;
  }

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
        router.push(
          `/workspaces/${workspaces.filter((i) => i.id !== workspace.id)[0].id}`
        );
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

  const handleWorkspaceNameInputChange = async (e: any) => {
    const updatedName = e.target.value as string;
    e.target.style.width = `${updatedName.length + 1}ch`;
    debounce(() => updateWorkspace(updatedName), 1000);
  };

  const updateWorkspace = async (name: string) => {
    setState((cs) => ({ ...cs, isUpdating: true }));
    try {
      await workspaceStore.updateWorkspace(workspace.id, { name });
    } catch (error) {
      toast({
        title: "Unable to update workspace",
        duration: 1500,
      });
    } finally {
      setState((cs) => ({ ...cs, isUpdating: false }));
    }
  };

  return (
    <div className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-2">
        <Input
          className={cn(
            "text-2xl font-bold border-0 focus-visible:ring-transparent	 focus-visible:ring-0 max-w-[400px]"
          )}
          style={{
            width: `${workspace.name.length + 1}ch`,
          }}
          type="text"
          defaultValue={workspace.name}
          onChange={handleWorkspaceNameInputChange}
        />
      </div>
      <div className="flex items-center gap-2">
        {isUpdating && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500 " />
        )}

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
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={deleteWorkspace}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateFormButton workspace={workspace} />
      </div>
    </div>
  );
};
