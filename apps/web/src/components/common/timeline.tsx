export function TimeLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid border-muted-foreground border-s-2 space-y-12">
      {children}
    </div>
  );
}

export function TimelineItem({
  children,
  timelineTitle,
}: { children: React.ReactNode; timelineTitle: string }) {
  return (
    <div className="   grid grid-cols-[300px_minmax(900px,_1fr)_50px] gap-8 justify-start transition-all  ">
      <div className="relative flex items-start justify-end mt-8">
        <div className="sticky top-24 left-0 w-full pb-8">
          <span className=" absolute top-3 left-0 h-0.5 bg-muted-foreground w-full z-45" />
          <span className="absolute top-0 right-0 ps-2 text-xl font-medium text-muted-foreground bg-background z-50">
            {timelineTitle}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
