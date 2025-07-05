"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Skeleton,
} from "@convoform/ui";

import { api } from "@/trpc/react";
import { Progress } from "@convoform/ui";
import { Gauge } from "lucide-react";

export function UsageCard() {
  const { data, isLoading } = api.usage.getUsgae.useQuery();

  if (isLoading) {
    return (
      <UsageCardShell>
        <UsageCardSkeleton />
      </UsageCardShell>
    );
  }

  if (data) {
    return (
      <UsageCardShell>
        {data.map((usage) => (
          <SidebarMenuItem
            key={`${usage.label}-${usage.value}-${usage.limit}`}
            className="space-y-2"
          >
            <SidebarMenuButton className="h-auto" asChild>
              <div>
                <div className="w-full space-y-2">
                  <div className="flex grid-cols-2 items-center justify-between gap-4 text-sm">
                    <span className="">{usage.label}</span>
                    <span className="text-muted-foreground">
                      {usage.value}/{usage.limit}
                    </span>
                  </div>
                  <Progress
                    className="h-1"
                    value={(usage.value / usage.limit) * 100}
                  />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </UsageCardShell>
    );
  }

  return null;
}

function UsageCardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>
        <Gauge className="mr-2" />
        Usage
      </SidebarGroupLabel>
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
