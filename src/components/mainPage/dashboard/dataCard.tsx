import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../../ui/skeleton";

type Props = {
  title: string;
  mainValue: string;
  secondaryValue?: string;
  dataType?: React.ReactNode;
};

function DataCard({ title, mainValue, secondaryValue, dataType }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {dataType && (
          <div className="text-xs text-muted-foreground">{dataType}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold lg:text-3xl">{mainValue}</div>
        {secondaryValue && (
          <p className="text-xs text-muted-foreground">{secondaryValue}</p>
        )}
      </CardContent>
    </Card>
  );
}

const DataCardSkeleton = () => {
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
