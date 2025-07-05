"use client";

import { UsageCard } from "@/app/(protectedPage)/(mainPage)/_components/usageCard";
import { cn } from "@/lib/utils";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import { FileText, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import BrandNameLink from "./common/brandName";

export function AppSidebar({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navigationLinks = useMemo(
    () => [
      {
        name: "Dashboard",
        link: "/dashboard",
        isActive: pathname.includes("dashboard"),
        icon: <LayoutDashboardIcon />,
      },
      {
        name: "Forms",
        link: "/forms",
        isActive: pathname.includes("/forms"),
        icon: <FileText />,
      },
    ],
    [pathname],
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="py-4">
            <SidebarMenuButton asChild>
              <BrandNameLink className="text-xl lg:text-2xl" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={cn(
              "w-full flex  items-center justify-between gap-2 ",
              isCollapsed ? "flex-col items-start pe-0" : "pe-2",
            )}
          >
            <SidebarMenuButton asChild>
              {!isCollapsed && (
                <OrganizationSwitcher
                  afterSelectOrganizationUrl="/dashboard"
                  hidePersonal
                  // appearance={{
                  //   elements: {
                  //     organizationPreviewTextContainer__organizationSwitcherTrigger:
                  //       {
                  //         display: isCollapsed ? "none" : "block",
                  //       },
                  //   },
                  // }}
                  afterLeaveOrganizationUrl="/organizations"
                  fallback={<Skeleton className="h-6 w-40 animate-pulse" />}
                />
              )}
            </SidebarMenuButton>
            <SidebarMenuAction asChild>
              <UserButton
                fallback={
                  <Skeleton className="h-6 w-6 animate-pulse rounded-full" />
                }
              />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationLinks.map((navItem) => (
                <SidebarMenuItem key={navItem.link}>
                  <SidebarMenuButton
                    tooltip={navItem.name}
                    isActive={navItem.isActive}
                    asChild
                  >
                    <Link href={navItem.link}>
                      {navItem.icon}
                      <span>{navItem.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>{!isCollapsed && <UsageCard key={orgId} />}</SidebarFooter>
    </Sidebar>
  );
}
