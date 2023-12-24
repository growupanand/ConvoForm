import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4">
      <div className="grid gap-4">
        <Skeleton className="w-full h-[40px] bg-secondary" />
        <Skeleton className="w-full h-[40px] bg-primary" />
      </div>
    </div>
  );
}
