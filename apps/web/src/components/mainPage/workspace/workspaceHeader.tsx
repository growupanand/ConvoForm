"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Workspace } from "@convoform/db";
import { Button } from "@convoform/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui/components/ui/dropdown-menu";
import { Input } from "@convoform/ui/components/ui/input";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Edit, MoreVertical, Trash } from "lucide-react";

import { cn, debounce } from "@/lib/utils";
import { api } from "@/trpc/react";
import Spinner from "../../common/spinner";
import CreateFormButton from "./createFormButton";

type Props = {
  workspace: Workspace;
};

export const WorkspaceHeader = ({ workspace }: Props) => {
  const currentWorkspaceId = workspace.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteWorkspace = api.workspace.delete.useMutation({
    onSuccess: async () => {
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500 p-1">
                <Check className="text-white " />
              </div>
              <span>Workspace deleted</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
      await queryClient.invalidateQueries({
        queryKey: [["workspace"]],
      });

      router.push("/dashboard");
    },
    onError: () =>
      toast({
        title: "Unable to delete workspace",
        duration: 1500,
      }),
  });

  const handleDeleteWorkspace = useCallback(
    async () => deleteWorkspace.mutateAsync({ id: currentWorkspaceId }),
    [currentWorkspaceId],
  );
  const isDeleting = deleteWorkspace.isPending;

  const updateWorkspace = api.workspace.patch.useMutation({
    onSuccess: () => {
      toast({
        title: "Workspace updated",
        duration: 1500,
      });
      queryClient.invalidateQueries({
        queryKey: [["workspace"]],
      });
    },
    onError: () =>
      toast({
        title: "Unable to update workspace",
        duration: 1500,
        variant: "destructive",
      }),
  });

  const handleUpdateWorkspace = useCallback(
    async (name: string) =>
      await updateWorkspace.mutateAsync({
        id: currentWorkspaceId,
        name,
      }),
    [currentWorkspaceId],
  );

  const isUpdating = updateWorkspace.isPending;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleWorkspaceNameInputChange = async (e: any) => {
    const updatedName = e.target.value as string;
    debounce(() => handleUpdateWorkspace(updatedName), 1000);
  };

  const handleFocusInput = () => {
    // We are using timeout here because after click dropdown item focus is not working
    setTimeout(() => {
      if (!inputRef.current) {
        return;
      }
      inputRef.current.focus();
      // move cursor to end
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
    }, 400);
  };

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center justify-between lg:mb-10">
        <Input
          ref={inputRef}
          className={cn(
            "h-auto rounded-none border-0 border-transparent bg-transparent py-3 ps-0 text-xl font-medium hover:border-b hover:border-gray-300 focus-visible:border-b-2 focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 lg:text-2xl ",
          )}
          type="text"
          onChange={handleWorkspaceNameInputChange}
          defaultValue={workspace!.name}
        />
        <div className="flex items-center gap-2">
          {isUpdating && <Spinner />}
          <DropdownMenu>
            <DropdownMenuTrigger disabled={isDeleting} asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 focus-visible:ring-transparent"
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
                className="cursor-pointer"
                onClick={handleFocusInput}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit workspace
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleDeleteWorkspace}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <CreateFormButton workspace={workspace!} />
      </div>
    </div>
  );
};

export const WorkspaceHeaderSkeleton = () => {
  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center  justify-between lg:mb-10">
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
};
