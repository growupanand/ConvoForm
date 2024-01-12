"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import { Loader2, Menu, Plus } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import BrandName from "../brandName";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "../ui/use-toast";
import AppNavBarLink from "./appNavBarLink";
import { WorkspaceList } from "./workspaceList";
import WorkspaceListLoading from "./workspaceListLoading";

type State = {
  open: boolean;
};

export default function AppNavbar() {
  const [state, setState] = useState<State>({
    open: false,
  });
  const { open } = state;

  const closeSheet = () => setState((cs) => ({ ...cs, open: false }));

  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const workspaceStore = useWorkspaceStore();

  const { workspaces, isLoading, isBusyInCreatingWorkspace } = workspaceStore;

  const createNewWorkspace = async () => {
    try {
      const { id } = await workspaceStore.createWorkspace("New Workspace");
      toast({
        title: "Workspace created",
        duration: 1500,
      });
      router.push(`/workspaces/${id}/`);
    } catch (error) {
      toast({
        title: "Unable to create workspace",
        duration: 1500,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      closeSheet();
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <Sheet
          open={open}
          onOpenChange={(status) => setState((cs) => ({ ...cs, open: status }))}
        >
          <div className="relative flex w-full items-center justify-between p-3">
            <BrandName />
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="w-[90%] ">
            <Nav
              pathname={pathname}
              workspaces={workspaces}
              isLoading={isLoading}
              isBusyInCreatingWorkspace={isBusyInCreatingWorkspace}
              createNewWorkspace={createNewWorkspace}
              user={user}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop View */}
      <div className="bg-white-300 min-w-[300px]  max-lg:hidden">
        <Nav
          pathname={pathname}
          workspaces={workspaces}
          isLoading={isLoading}
          isBusyInCreatingWorkspace={isBusyInCreatingWorkspace}
          createNewWorkspace={createNewWorkspace}
          user={user}
        />
      </div>
    </>
  );
}

function Nav({
  pathname,
  workspaces,
  isLoading,
  isBusyInCreatingWorkspace,
  createNewWorkspace,
  user,
}: Readonly<{
  pathname: string;
  workspaces: any[];
  isLoading: boolean;
  isBusyInCreatingWorkspace: boolean;
  createNewWorkspace: () => void;
  user: any;
}>) {
  return (
    <nav className="flex h-full flex-col justify-between lg:p-5">
      <div>
        <div className="mb-5 flex justify-start ps-4">
          <BrandName className="text-xl lg:text-2xl" />
        </div>
        <div className="grid gap-2">
          <AppNavBarLink
            name="Dashboard"
            href="/dashboard"
            isActive={pathname.includes("dashboard")}
          />
          <div className="truncate">
            <div className="flex items-center justify-between ">
              <span className="ps-4 text-sm font-medium text-muted-foreground">
                Workspaces
              </span>
              <Button
                variant="link"
                className="pe-0 hover:no-underline"
                disabled={isBusyInCreatingWorkspace}
                onClick={createNewWorkspace}
              >
                {isBusyInCreatingWorkspace ? (
                  <Loader2 className=" h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>
            {isLoading && <WorkspaceListLoading />}
            {workspaces.length === 0 && !isLoading && (
              <div className="items-center] flex justify-between px-3">
                <span className="p-2 text-sm text-muted-foreground">
                  No workspaces
                </span>
              </div>
            )}
            <ScrollArea className="h-96">
              <WorkspaceList workspaces={workspaces} />
            </ScrollArea>
          </div>
        </div>
      </div>
      <div>
        {user && (
          <div className="flex items-center justify-between gap-2 lg:justify-evenly">
            <OrganizationSwitcher
              afterSelectOrganizationUrl="/dashboard"
              hidePersonal
            />
            <UserButton />
          </div>
        )}
      </div>
    </nav>
  );
}
