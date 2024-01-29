import {
  Card,
  CardContent,
  CardHeader,
} from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

export function DashboardPageLoading() {
  return (
    <div>
      <h1 className="mb-5 py-3 text-xl font-medium lg:text-2xl">Dashboard</h1>
      <div className="grid gap-3 lg:grid-cols-4">
        <DataCardSkeleton />
        <DataCardSkeleton />
      </div>
    </div>
  );
}

export const DataCardSkeleton = () => {
  return (
    <Card className="h-[130px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-2 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-10 w-6" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-2 w-10" />
        </div>
      </CardContent>
    </Card>
  );
};
