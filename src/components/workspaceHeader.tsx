"use client";

import { Check, MoreVertical } from "lucide-react";
import CreateFormButton from "./createFormButton";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { toast } from "./ui/use-toast";
import { useParams, useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { cn, debounce } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import Spinner from "./ui/spinner";

type State = {
  isDeleting: boolean;
  isUpdating: boolean;
};

export const WorkspaceHeader = () => {
  const [state, setState] = useState<State>({
    isDeleting: false,
    isUpdating: false,
  });
  const { isDeleting, isUpdating } = state;

  const params = useParams();
  const currentWorkspaceId = params.workspaceId as string;
  const workspaceStore = useWorkspaceStore();
  const { workspaces, isLoading } = workspaceStore;
  const currentWorkspace = workspaces.find((i) => i.id === currentWorkspaceId);

  const router = useRouter();

  const deleteWorkspace = async () => {
    setState((cs) => ({ ...cs, isDeleting: true }));
    try {
      await workspaceStore.deleteWorkspace(currentWorkspaceId);
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
      if (workspaces.filter((i) => i.id !== currentWorkspaceId).length > 0) {
        router.push(
          `/workspaces/${
            workspaces.filter((i) => i.id !== currentWorkspaceId)[0].id
          }`
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
            onClick={() => deleteWorkspace()}
          >
            {isDeleting ? <Spinner /> : "Retry"}
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
      await workspaceStore.updateWorkspace(currentWorkspaceId, { name });
    } catch (error) {
      toast({
        title: "Unable to update workspace",
        duration: 1500,
      });
    } finally {
      setState((cs) => ({ ...cs, isUpdating: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div>
          <Skeleton className="h-[40px] w-[125px]" />
        </div>
      </div>
    );
  }

  if (!isLoading && !currentWorkspace) {
    return null;
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <Input
            className={cn(
              "text-2xl font-bold border-0 focus-visible:ring-transparent	 focus-visible:ring-0 max-w-[400px]"
            )}
            style={{
              width: `${currentWorkspace!.name.length + 1}ch`,
            }}
            type="text"
            defaultValue={currentWorkspace!.name}
            onChange={handleWorkspaceNameInputChange}
          />
        </div>
        <div className="flex items-center gap-2">
          {isUpdating && <Spinner />}
          <DropdownMenu>
            <DropdownMenuTrigger disabled={isDeleting} asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner />
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
                Delete workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <CreateFormButton workspace={currentWorkspace!} />
      </div>
    </div>
  );
};
