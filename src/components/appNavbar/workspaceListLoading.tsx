import { Skeleton } from "../ui/skeleton";

const WorkspaceListLoading = () => {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center] px-3">
        <Skeleton className="w-[100px] h-[15px] rounded-full bg-gray-400" />
        <Skeleton className="w-[20px] h-[15px] bg-gray-400 " />
      </div>
      <div className="flex justify-between items-center] px-3">
        <Skeleton className="w-[100px] h-[15px] rounded-full bg-gray-400" />
        <Skeleton className="w-[20px] h-[15px] bg-gray-400 " />
      </div>
    </div>
  );
};

export default WorkspaceListLoading;
