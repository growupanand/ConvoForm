"use client";

import type { Workspace } from "@convoform/db/src/schema";
import { HeadingInput } from "@convoform/ui";
import { Button } from "@convoform/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

import { ConfirmAction } from "@/components/common/confirmAction";
import Spinner from "@/components/common/spinner";
import { debounce } from "@/lib/utils";
import { api } from "@/trpc/react";

type Props = {
  workspace: Workspace;
};

export const WorkspaceHeader = ({ workspace }: Props) => {
  const currentWorkspaceId = workspace.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteWorkspace = api.workspace.delete.useMutation({
    onSuccess: async () => {
      toast.success("Workspace deleted", {
        duration: 1500,
      });
      await queryClient.invalidateQueries({
        queryKey: [["workspace"]],
      });

      router.push("/dashboard");
    },
  });

  const handleDeleteWorkspace = useCallback(
    async () => deleteWorkspace.mutate({ id: currentWorkspaceId }),
    [currentWorkspaceId],
  );
  const isDeleting = deleteWorkspace.isPending;

  const updateWorkspace = api.workspace.patch.useMutation({
    onSuccess: () => {
      toast.success("Workspace updated", {
        duration: 1500,
      });
      queryClient.invalidateQueries({
        queryKey: [["workspace"]],
      });
    },
  });

  const handleUpdateWorkspace = useCallback(
    (name: string) =>
      updateWorkspace.mutate({
        id: currentWorkspaceId,
        name,
      }),
    [currentWorkspaceId],
  );

  const isUpdating = updateWorkspace.isPending;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleWorkspaceNameInputChange = (e: any) => {
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
    <div className="mb-5 flex items-center justify-between">
      <HeadingInput
        ref={inputRef}
        type="text"
        onChange={handleWorkspaceNameInputChange}
        defaultValue={workspace?.name}
      />
      <div className="flex items-center gap-2 pl-5">
        {isUpdating && <Spinner />}
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isDeleting} asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 focus-visible:ring-transparent"
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner /> : <MoreVertical className="h-4 w-4" />}
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
            <ConfirmAction
              onConfirm={handleDeleteWorkspace}
              title="Are you sure you want to delete this workspace?"
              description="This action will delete all data related to this workspace. This action cannot be undone."
              confirmText="Yes, delete workspace"
            >
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete workspace
              </DropdownMenuItem>
            </ConfirmAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const WorkspaceHeaderSkeleton = () => {
  return (
    <div className="mb-5">
      <div className=" flex items-center  justify-between mb-10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Spinner />
        </div>
      </div>
      <div>
        <Skeleton className="h-[40px] w-[125px]" />
      </div>
    </div>
  );
};
