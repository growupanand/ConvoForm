"use client";

import { User } from "next-auth";
import BrandName from "../brandName";
import LogOutButton from "../logoutButton";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { appNavbarConfig } from "@/config/appNavBarConfig";
import { useEffect, useState } from "react";
import { Workspace } from "@prisma/client";
import { Check, Loader2, Plus } from "lucide-react";
import { toast } from "../ui/use-toast";
import { createWorkspaceController } from "@/lib/controllers/workspace";
import { WorkspaceList } from "./workspaceList";
import { Skeleton } from "../ui/skeleton";

type Props = {
  user: Omit<User, "id">;
};

type State = {
  isLoading: boolean;
  workspaces: Workspace[];
  isBusyInCreatingWorkspace: boolean;
};

export default function AppNavbar({ user }: Props) {
  const pathname = usePathname();

  const [state, setState] = useState<State>({
    isLoading: true,
    workspaces: [],
    isBusyInCreatingWorkspace: false,
  });
  const { isLoading, workspaces, isBusyInCreatingWorkspace } = state;

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

  const createNewWorkspace = async () => {
    setState((cs) => ({ ...cs, isBusyInCreatingWorkspace: true }));
    try {
      const workspace = await createWorkspaceController();
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                <Check className="text-white " />
              </div>
              <span>Workspace created</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
      setState((cs) => ({
        ...cs,
        workspaces: [workspace, ...cs.workspaces],
      }));
    } catch (error) {
      toast({
        title: "Unable to create workspace",
        duration: 1500,
      });
    } finally {
      setState((cs) => ({ ...cs, isBusyInCreatingWorkspace: false }));
    }
  };

  const onWorkspaceDelete = (workspace: Workspace) => {
    setState((cs) => ({
      ...cs,
      workspaces: cs.workspaces.filter((w) => w.id !== workspace.id),
    }));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <nav className="h-full flex flex-col justify-between p-5">
      <div>
        <div className="mb-5">
          <BrandName />
        </div>
        <div className="grid gap-1">
          <div className="mb-5">
            {appNavbarConfig.dashboardLinks.map((link) => (
              <Link href={link.href} key={link.name + link.href}>
                <Button
                  variant="link"
                  className={cn(
                    "w-full justify-start hover:no-underline text-gray-500 hover:text-gray-800",
                    link.href === pathname && "text-gray-800"
                  )}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>
          <div className="flex justify-between items-center ">
            <span className="ps-3 font-semibold">Workspaces</span>
            <Button
              variant="link"
              className="hover:no-underline text-gray-500 hover:text-gray-800"
              disabled={isBusyInCreatingWorkspace}
              onClick={createNewWorkspace}
            >
              {isBusyInCreatingWorkspace ? (
                <Loader2 className=" h-4 w-4 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="grid gap-1">
            {isLoading && (
              <div className="grid gap-2">
                <div className="flex justify-between items-center] px-3">
                  <Skeleton className="w-[100px] h-[15px] rounded-full bg-gray-400" />
                  <Skeleton className="w-[20px] h-[15px] bg-gray-400 " />
                </div>
                <div className="flex justify-between items-center] px-3">
                  <Skeleton className="w-[100px] h-[15px] rounded-full bg-gray-400" />
                  <Skeleton className="w-[20px] h-[15px] bg-gray-400 " />
                </div>
              </div>
            )}
            {workspaces.length === 0 && !isLoading && (
              <div className="flex justify-between items-center] px-3">
                <span className="text-gray-500">No workspaces</span>
              </div>
            )}
            <WorkspaceList
              workspaces={workspaces}
              onWorkspaceDelete={onWorkspaceDelete}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div className="text-sm font-semibold">{user.name}</div>
        <LogOutButton />
      </div>
    </nav>
  );
}
