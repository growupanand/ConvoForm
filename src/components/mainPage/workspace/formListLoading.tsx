import { Skeleton } from "../../ui/skeleton";

export default function FormListLoading() {
  return (
    <div className="grid divide-y divide-border">
      <FormsListSkeleton />
      <FormsListSkeleton />
      <FormsListSkeleton />
    </div>
  );
}

const FormsListSkeleton = () => (
  <div className="flex items-center justify-between p-3 ">
    <Skeleton className=" h-[20px] w-[130px] rounded-full" />
    <Skeleton className=" h-[30px] w-[30px] " />
  </div>
);
