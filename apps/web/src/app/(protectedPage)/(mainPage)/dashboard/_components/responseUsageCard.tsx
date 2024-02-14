"use client";

import { Card, CardContent } from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { ProgressCircle } from "@tremor/react";

import { formSubmissionLimit } from "@/lib/config/pricing";
import { api } from "@/trpc/react";

type Props = {
  organizationId: string;
};

export function ResponseUsageCard({ organizationId }: Readonly<Props>) {
  const { data, isFetching } = api.metrics.getResponsesCount.useQuery({
    organizationId,
  });

  if (isFetching) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2">
            <div>
              <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                <span>Response usage</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-[20px] w-[40px]" />
              </div>
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-[58px] w-[58px] rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data) {
    const usage = data;
    const maximum = formSubmissionLimit;
    const usagePercentage = (usage / maximum) * 100;

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2">
            <div>
              <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                <span>Response usage</span>
              </p>
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
        </CardContent>
      </Card>
    );
  }

  return null;
}
