import { Skeleton } from "./ui/skeleton";

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
  <div className="p-3 flex justify-between items-center ">
    <Skeleton className=" w-[130px] h-[20px] rounded-full" />
    <Skeleton className=" w-[30px] h-[30px] " />
  </div>
);
