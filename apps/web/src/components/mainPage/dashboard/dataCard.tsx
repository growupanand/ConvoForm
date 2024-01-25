"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

import Spinner from "@/components/common/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../../ui/skeleton";

const BarChart = dynamic(
  async () => import("@tremor/react").then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="mr-2" /> Loading
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

function DataCard({
  title,
  mainValue,
  secondaryValue,
  dataType,
  chartData,
}: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="relative flex flex-col-reverse items-stretch gap-3 lg:flex-row">
          <div className="flex items-stretch justify-between gap-2 lg:flex-col lg:items-start lg:justify-center">
            <CardTitle className="whitespace-nowrap text-lg font-medium">
              <span>{title}</span>
              {secondaryValue && (
                <p className="text-muted-foreground text-xs font-normal">
                  {secondaryValue}
                </p>
              )}
            </CardTitle>
            <div className="flex flex-col items-end lg:items-center">
              <div className="text-3xl font-semibold lg:text-5xl">
                {mainValue}
              </div>
              {dataType && (
                <div className="text-md  text-muted-foreground whitespace-nowrap">
                  {dataType}
                </div>
              )}
            </div>
          </div>
          {chartData && (
            <div className="h-[150px] grow  ">
              <BarChart
                className="h-full w-full"
                data={chartData}
                index="name"
                categories={["count"]}
                yAxisWidth={30}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const DataCardSkeleton = () => {
  return (
    <Card className="h-[130px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-2 w-20 bg-gray-300" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-10 w-6 bg-gray-700" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-2 w-10" />
        </div>
      </CardContent>
    </Card>
  );
};

DataCard.Skeleton = DataCardSkeleton;

export { DataCard };
