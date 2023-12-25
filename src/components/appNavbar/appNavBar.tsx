"use client";

import { User } from "next-auth";
import BrandName from "../brandName";
import LogOutButton from "../logoutButton";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "../ui/use-toast";
import { WorkspaceList } from "./workspaceList";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import WorkspaceListLoading from "./workspaceListLoading";
import AppNavBarLink from "./appNavBarLink";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import ProfileCard from "../profileCard";

type Props = {
  user: Omit<User, "id">;
};

export default function AppNavbar({ user }: Props) {
  const pathname = usePathname();

  const workspaceStore = useWorkspaceStore();

  const { workspaces, isLoading, isBusyInCreatingWorkspace } = workspaceStore;

  const createNewWorkspace = async () => {
    try {
      await workspaceStore.createWorkspace("New Workspace");
      toast({
        title: "Workspace created",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Unable to create workspace",
        duration: 1500,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="h-full flex flex-col justify-between p-5">
      <div>
        <div className="mb-5 flex justify-start ps-4">
          <BrandName />
        </div>
        <div className="grid gap-2">
          <div className="">
            <AppNavBarLink
              name="Dashboard"
              href="/dashboard"
              isActive={pathname.includes("dashboard")}
            />
          </div>
          <div className="truncate">
            <div className="flex justify-between items-center ">
              <span className="ps-4 text-muted-foreground font-medium text-sm">
                Workspaces
              </span>
              <Button
                variant="link"
                className="hover:no-underline pe-0"
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
            {isLoading && <WorkspaceListLoading />}
            {workspaces.length === 0 && !isLoading && (
              <div className="flex justify-between items-center] px-3">
                <span className="text-gray-500">No workspaces</span>
              </div>
            )}
            <WorkspaceList workspaces={workspaces} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start ">
        <ProfileCard user={user} />
        <LogOutButton />
      </div>
    </nav>
  );
}
