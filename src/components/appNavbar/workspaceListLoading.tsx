import { Skeleton } from "../ui/skeleton";

const WorkspaceListLoading = () => {
  return (
    <div className="grid gap-2">
      <div className="items-center] flex justify-between px-3">
        <Skeleton className="h-[15px] w-[100px] rounded-full bg-gray-400" />
        <Skeleton className="h-[15px] w-[20px] bg-gray-400 " />
      </div>
      <div className="items-center] flex justify-between px-3">
        <Skeleton className="h-[15px] w-[100px] rounded-full bg-gray-400" />
        <Skeleton className="h-[15px] w-[20px] bg-gray-400 " />
      </div>
    </div>
  );
};

export default WorkspaceListLoading;
