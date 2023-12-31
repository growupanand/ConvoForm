"use client";

import BrandName from "../brandName";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { Loader2, Menu, Plus } from "lucide-react";
import { toast } from "../ui/use-toast";
import { WorkspaceList } from "./workspaceList";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import WorkspaceListLoading from "./workspaceListLoading";
import AppNavBarLink from "./appNavBarLink";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";

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
          <div className="w-full p-3 flex items-center justify-between relative">
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
      <div className="max-lg:hidden bg-white-300 min-w-[300px] bg-gray-50">
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
    <nav className="h-full flex flex-col justify-between lg:p-5">
      <div>
        <div className="mb-5 flex justify-start ps-4">
          <BrandName className="text-xl" />
        </div>
        <div className="grid gap-2">
          <AppNavBarLink
            name="Dashboard"
            href="/dashboard"
            isActive={pathname.includes("dashboard")}
          />
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
                <span className="text-muted-foreground p-2 text-sm">
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
          <div className="flex justify-between lg:justify-evenly gap-2 items-center">
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
