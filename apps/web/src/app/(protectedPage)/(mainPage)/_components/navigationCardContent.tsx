"use client";

import { ClerkLoading, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Skeleton } from "@convoform/ui";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import BrandNameLink from "@/components/common/brandName";
import type { NavigationConfig } from "@/lib/types/navigation";
import { NavigationLinks } from "./mainNavigation/mainNavigation";
import { UsageCard } from "./usageCard";

type Props = {
  orgId: string;
};

export function NavigationCardContent({ orgId }: Readonly<Props>) {
  const pathname = usePathname();

  const navigationLinks = useMemo<NavigationConfig>(
    () =>
      [
        {
          name: "Dashboard",
          link: "/dashboard",
          isActive: pathname.includes("dashboard"),
        },
        {
          name: "Forms",
          link: "/forms",
          isActive: pathname.includes("/forms"),
        },
      ] as NavigationConfig,
    [pathname],
  );

  const UserActions = () => (
    <div className="flex items-center justify-between min-h-14">
      <ClerkLoading>
        <Skeleton className="h-6 w-20 animate-pulse" />
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
