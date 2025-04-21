"use client";

import { ClerkLoading, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Skeleton } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import BrandNameLink from "@/components/common/brandName";
import type { NavLink, NavigationConfig } from "@/lib/types/navigation";
import { api } from "@/trpc/react";
import { NavigationLinks } from "./mainNavigation/mainNavigation";
import { UsageCard } from "./usageCard";

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
      toast.success("Workspace created", {
        duration: 1500,
      });
      queryClient.invalidateQueries({
        queryKey: [["workspace", "getAll"]],
      });
      router.push(`/workspaces/${newWorkspace.id}/`);
    },
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
    <Loader2 className=" size-4 animate-spin" />
  ) : (
    <Plus className="size-4" />
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
      ? (workspaces.map((workspace) => ({
          name: workspace.name,
          link: `/workspaces/${workspace.id}`,
          isActive: pathname.includes(`${workspace.id}`),
        })) as NavLink[])
      : [workspaceLink];
  }, [workspaces, pathname, workspaceLink]);

  const navigationLinks = useMemo<NavigationConfig>(
    () =>
      [
        {
          name: "Dashboard",
          link: "/dashboard",
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
    <div className="flex items-center justify-between py-4">
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
    </div>
  );

  return (
    <nav className="flex h-full flex-col justify-between lg:p-5">
      <div>
        <div className="mb-5 flex flex-col gap-3">
          <div>
            <BrandNameLink className="text-xl lg:text-2xl" />
          </div>
        </div>
        <NavigationLinks navigationLinks={navigationLinks} />
      </div>
      <div className="grid gap-y-4">
        <UsageCard key={orgId} />
        <UserActions />
      </div>
    </nav>
  );
}

export default NavigationCardContent;
