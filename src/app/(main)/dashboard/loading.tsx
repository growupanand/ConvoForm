import { DataCard } from "@/components/dashboard/dataCard";

export default function Loading() {
  return (
    <div>
      <h1 className="mb-5 py-3 text-xl font-medium">Dashboard</h1>
      <div className="grid gap-3 lg:grid-cols-4">
        <DataCard.Skeleton />
        <DataCard.Skeleton />
      </div>
    </div>
  );
}
