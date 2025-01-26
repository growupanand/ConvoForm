"use client";

import { Skeleton } from "@convoform/ui";

import { api } from "@/trpc/react";
import { Progress } from "@convoform/ui";

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
        <div className="grid gap-2">
          {data.map((usage) => (
            <div
              key={`${usage.label}-${usage.value}-${usage.limit}`}
              className="grid gap-2"
            >
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
          ))}
        </div>
      </UsageCardShell>
    );
  }

  return null;
}

function UsageCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <h4 className="mb-3 text-xs text-muted-foreground">Usage</h4>
      {children}
    </div>
  );
}

function UsageCardSkeleton() {
  return (
    <div className="grid  gap-2">
      <div className="flex justify-between">
        <Skeleton className="h-2 w-20" />
        <Skeleton className="h-2 w-12" />
      </div>
      <Skeleton className="h-1 w-full" />
    </div>
  );
}
