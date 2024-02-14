"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Alert, AlertTitle } from "@convoform/ui/components/ui/alert";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

import Spinner from "@/components/common/spinner";

const LineChart = dynamic(
  async () => import("@tremor/react").then((mod) => mod.LineChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="mr-2" /> Loading chart
      </div>
    ),
  },
);

type Props = {
  title: string;
  mainValue: string;
  secondaryValue?: string;
  dataType?: ReactNode;
  chartData?: any;
};

export function DataCard({
  title,
  mainValue,
  secondaryValue,
  dataType,
  chartData,
}: Readonly<Props>) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <CardTitle className="font-normal">
            {title}
            {secondaryValue && (
              <p className="text-muted-foreground text-sm font-normal">
                {secondaryValue}
              </p>
            )}
          </CardTitle>
          <div className="text-right">
            <div className="text-4xl font-bold">{mainValue}</div>
            {dataType && (
              <p className="text-muted-foreground text-sm font-normal">
                {dataType}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      {chartData && (
        <CardContent className="pt-3">
          <div className="h-[150px] grow  ">
            <LineChart
              className="h-full w-full"
              data={chartData}
              index="name"
              categories={["count"]}
              yAxisWidth={30}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function DataCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle>
            <Skeleton className="mb-2 h-4 w-40" />
            <Skeleton className="h-3 w-20" />
          </CardTitle>
          <div className="flex flex-col items-end">
            <Skeleton className="mb-2 h-5 w-10" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[150px] grow">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DataCardError({
  onRetry,
  dataSourceName,
}: Readonly<{ onRetry: () => void; dataSourceName: string }>) {
  return (
    <Card className="items-center justify-center border-none bg-red-50">
      <Alert variant="destructive" className="self-stretch border-none ">
        <AlertTitle className="text-2xl font-normal">
          {dataSourceName}
        </AlertTitle>
        <div className="flex items-center justify-start gap-3">
          <span>Unable to fetch data</span>
          <Button size="sm" variant="destructive" onClick={() => onRetry()}>
            Retry
          </Button>
        </div>
      </Alert>
    </Card>
  );
}
