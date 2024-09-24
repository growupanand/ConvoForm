import { cn } from "@/lib/utils";

export function TimeLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid lg:border-muted-foreground lg:border-s-2  lg:space-y-12">
      {children}
    </div>
  );
}

export function TimelineItem({
  children,
  timelineTitle,
}: { children: React.ReactNode; timelineTitle?: string }) {
  return (
    <div className="grid lg:grid-cols-[300px_minmax(auto,_1fr)_50px] gap-8 lg:justify-start transition-all  ">
      <div
        className={cn(
          "relative flex items-start justify-end mt-8",
          !timelineTitle && "max-lg:hidden",
        )}
      >
        <div className="sticky top-24 left-0 w-full pb-4 lg:pb-8">
          <span className=" absolute top-3 left-0 h-0.5 bg-muted-foreground w-full z-45 max-lg:hidden" />
          <span className="absolute top-0 lg:right-0 ps-4 text-xl font-medium text-muted-foreground bg-background z-50">
            {timelineTitle}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
