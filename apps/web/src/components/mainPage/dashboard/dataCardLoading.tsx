import { DataCardSkeleton } from "@/components/common/dataCard/dataCard";

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
