"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@convoform/ui";

import { api } from "@/trpc/react";
import { Progress } from "@convoform/ui";

export function UsageCard() {
  const { data, isLoading } = api.usage.getUsgae.useQuery();

  if (isLoading) {
    return (
      <UsageCardShell>
        <div className="space-y-4 mt-4">
          <UsageCardSkeleton />
          <UsageCardSkeleton />
        </div>
      </UsageCardShell>
    );
  }

  if (data) {
    return (
      <UsageCardShell>
        {data.map((usage) => {
          // Handle custom formatting for different usage types
          const displayValue = usage.readableValue
            ? usage.readableValue
            : usage.value.toString();
          const displayLimit = usage.readableLimit
            ? usage.readableLimit
            : usage.limit.toString();

          return (
            <SidebarMenuItem
              key={`${usage.label}-${usage.value}-${usage.limit}`}
              className="space-y-2"
            >
              <SidebarMenuButton className="h-auto" asChild>
                <div>
                  <div className="w-full space-y-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex grid-cols-2 items-baseline justify-between gap-4 text-sm">
                            <span className="text-nowrap">{usage.label}</span>
                            <span className="text-subtle-foreground font-bold text-xs">
                              {displayValue}/{displayLimit}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent align="end" className="capitalize">
                          {usage.limitPeriod}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Progress
                      className="h-1"
                      value={Math.min((usage.value / usage.limit) * 100, 100)}
                    />
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </UsageCardShell>
    );
  }

  return null;
}

function UsageCardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>Usage limit</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>{children}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function UsageCardSkeleton() {
  return (
    <SidebarMenuItem className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-2 w-20" />
        <Skeleton className="h-2 w-12" />
      </div>
      <Skeleton className="h-1 w-full" />
    </SidebarMenuItem>
  );
}
