"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Workspace } from "@prisma/client";
import { useAtom } from "jotai";
import { Check, Edit, MoreVertical, Trash } from "lucide-react";

import { workspacesAtom } from "@/lib/atoms/workspaceAtoms";
import {
  deleteWorkspaceController,
  updateWorkspaceController,
} from "@/lib/controllers/workspace";
import { cn, debounce } from "@/lib/utils";
import Spinner from "../../common/spinner";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "../../ui/use-toast";
import CreateFormButton from "./createFormButton";

type Props = {
  workspace: Workspace;
};

type State = {
  isDeleting: boolean;
  isUpdating: boolean;
};

export const WorkspaceHeader = ({ workspace }: Props) => {
  const [state, setState] = useState<State>({
    isDeleting: false,
    isUpdating: false,
  });
  const { isDeleting, isUpdating } = state;
  const [workspaces, setWorkspaces] = useAtom(workspacesAtom);

  const currentWorkspaceId = workspace.id;
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteWorkspace = async () => {
    setState((cs) => ({ ...cs, isDeleting: true }));
    try {
      await deleteWorkspaceController(currentWorkspaceId);
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
      setWorkspaces((cs) => cs.filter((i) => i.id !== currentWorkspaceId));
      if (workspaces.filter((i) => i.id !== currentWorkspaceId).length > 0) {
        router.push(
          `/workspaces/${
            workspaces.filter((i) => i.id !== currentWorkspaceId)[0].id
          }`,
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
            onClick={() => handleDeleteWorkspace()}
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
    debounce(() => handleUpdateWorkspace(updatedName), 1000);
  };

  const handleUpdateWorkspace = async (updatedName: string) => {
    setState((cs) => ({ ...cs, isUpdating: true }));
    try {
      await updateWorkspaceController(currentWorkspaceId, {
        name: updatedName,
      });
      setWorkspaces((cs) =>
        cs.map((i) =>
          i.id === currentWorkspaceId ? { ...i, name: updatedName } : i,
        ),
      );
    } catch (error) {
      toast({
        title: "Unable to update workspace",
        duration: 1500,
      });
    } finally {
      setState((cs) => ({ ...cs, isUpdating: false }));
    }
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
