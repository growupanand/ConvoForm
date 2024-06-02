"use client";

import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { ProgressCircle } from "@tremor/react";

import { CardShell } from "@/components/common/cardShell";
import { formSubmissionLimit } from "@/lib/config/pricing";
import { api } from "@/trpc/react";

type Props = {
  organizationId: string;
};

export function ResponseUsageCard({ organizationId }: Readonly<Props>) {
  const { data, isLoading } = api.metrics.getResponsesCount.useQuery({
    organizationId,
  });

  if (isLoading) {
    return (
      <ResponseUsageCardShell>
        <ResponseUsageCardSkeleton />
      </ResponseUsageCardShell>
    );
  }

  if (data) {
    const usage = data;
    const maximum = formSubmissionLimit;
    const usagePercentage = Math.round((usage / maximum) * 100);

    return (
      <ResponseUsageCardShell>
        <div className="grid grid-cols-2">
          <div>
            <p className="mt-3 flex items-end">
              <span className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
                {usage}
              </span>
              <span className="text-tremor-content-subtle dark:text-dark-tremor-content-subtle font-semibold">
                /{maximum}
              </span>
            </p>
          </div>
          <div className="relative flex justify-end">
            <ProgressCircle value={usagePercentage}>
              <span className="text-muted-foreground font-medium">
                {usagePercentage}%
              </span>
            </ProgressCircle>
          </div>
        </div>
      </ResponseUsageCardShell>
    );
  }

  return null;
}

function ResponseUsageCardShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CardShell title="Plan usage" secondaryText="Free plan">
      {children}
    </CardShell>
  );
}

function ResponseUsageCardSkeleton() {
  return (
    <div className="grid grid-cols-2">
      <div>
        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-[20px] w-[40px]" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-[58px] w-[58px] rounded-full" />
      </div>
    </div>
  );
}
