"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClerkLoading, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";

import BrandName from "@/components/common/brandName";
import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { NavigationConfig } from "@/lib/types/navigation";
import { api } from "@/trpc/react";
import { NavigationLinks } from "./mainNavigation/mainNavigation";

type Props = {
  orgId: string;
};

export function NavigationCardContent({ orgId }: Readonly<Props>) {
  const { isLoading, data, isError, refetch } = api.workspace.getAll.useQuery({
    organizationId: orgId,
  });
  const isLoadingWorkspaces = isLoading;
  const workspaces = data ?? [];
  const queryClient = useQueryClient();

  const createWorkspace = api.workspace.create.useMutation({
    onSuccess: (newWorkspace) => {
      toast({
        title: "Workspace created",
        duration: 1500,
      });
      queryClient.invalidateQueries({
        queryKey: [["workspace", "getAll"]],
      });
      router.push(`/workspaces/${newWorkspace.id}/`);
    },
    onError: (error) =>
      toast({
        title: "Unable to create workspace",
        duration: 2000,
        variant: "destructive",
        description: isRateLimitErrorResponse(error)
          ? error.message
          : undefined,
      }),
  });
  const isCreatingWorkspace = createWorkspace.isPending;

  const handleCreateWorkspace = useCallback(() => {
    createWorkspace.mutate({
      organizationId: orgId,
      name: "New Workspace",
    });
  }, [orgId]);

  const router = useRouter();

  const createWorkspaceActionIcon = isCreatingWorkspace ? (
    <Loader2 className=" h-4 w-4 animate-spin" />
  ) : (
    <Plus className="h-5 w-5" />
  );

  const pathname = usePathname();

  const workspaceLink = {
    text: isError ? "Unable to load workspaces" : "No workspaces",
    variant: isError ? "error" : "default",
    action: isError
      ? {
          label: "Retry",
          onClick: refetch,
        }
      : undefined,
  };

  const workspacesLinks = useMemo(() => {
    return workspaces.length > 0
      ? workspaces.map((workspace) => ({
          name: workspace.name,
          path: `/workspaces/${workspace.id}`,
          isActive: pathname.includes(`${workspace.id}`),
        }))
      : [workspaceLink];
  }, [workspaces, pathname, workspaceLink]);

  const navigationLinks = useMemo<NavigationConfig>(
    () =>
      [
        {
          name: "Dashboard",
          path: "/dashboard",
          isActive: pathname.includes("dashboard"),
        },
        {
          title: "Workspaces",
          action: {
            icon: createWorkspaceActionIcon,
            onClick: handleCreateWorkspace,
            disabled: isCreatingWorkspace,
          },
          links: isLoadingWorkspaces
            ? [
                {
                  text: "Loading workspaces",
                },
              ]
            : workspacesLinks,
        },
      ] as NavigationConfig,
    [workspacesLinks, pathname, isCreatingWorkspace, isLoadingWorkspaces],
  );

  const UserActions = () => (
    <>
      <ClerkLoading>
        <Skeleton className="h-10 w-full animate-pulse rounded-full" />
        <Skeleton className="h-10 w-10 animate-pulse rounded-full" />
      </ClerkLoading>
      <OrganizationSwitcher
        afterSelectOrganizationUrl="/dashboard"
        hidePersonal
        afterLeaveOrganizationUrl="/organizations"
      />
      <UserButton />
    </>
  );

  return (
    <nav className="flex h-full flex-col justify-between lg:p-5">
      <div>
        <div className="mb-5 flex flex-col gap-3 ps-4">
          <div>
            <BrandName className="text-xl lg:text-2xl" />
          </div>
          <div className="flex items-center justify-between gap-2 lg:hidden lg:justify-evenly">
            <UserActions />
          </div>
        </div>
        <NavigationLinks navigationLinks={navigationLinks} />
      </div>
      <div className="max-lg:hidden">
        <div className="flex items-center justify-between gap-2 lg:justify-evenly">
          <UserActions />
        </div>
      </div>
    </nav>
  );
}

export default NavigationCardContent;
