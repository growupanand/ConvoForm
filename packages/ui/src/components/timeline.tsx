import { cn } from "../lib/utils";

type TimelineProps = {
  children: React.ReactNode;
  className?: string;
};

type TimelineItemProps = {
  children: React.ReactNode;
  className?: string;
  bulletColor?: string;
  lineColor?: string;
  hideBullet?: boolean;
  hideLine?: boolean;
  timelineTitle?: string;
};

export const Timeline = ({ children, className }: TimelineProps) => {
  return <ol className={cn("grid gap-12 px-2", className)}>{children}</ol>;
};

export const TimelineItem = ({
  children,
  className,
  bulletColor = "bg-gray-300",
  lineColor = "bg-gray-200",
  hideBullet = false,
  hideLine = false,
  timelineTitle,
}: TimelineItemProps) => {
  return (
    <li className={cn("relative group", className)}>
      <div className="lg:grid lg:grid-cols-[200px_auto] lg:gap-8">
        {/* Timeline Title - Now positioned on the left */}
        {timelineTitle && (
          <div className="h-fit sticky top-24 me-4 mb-4 lg:mb-0">
            <div className="text-xl font-medium text-muted-foreground bg-background z-50 text-right">
              {timelineTitle}
            </div>
          </div>
        )}

        {/* Content container - with relative positioning for the bullet */}
        <div className="relative">
          {/* Vertical line */}
          {!hideLine && (
            <div
              className={cn(
                "absolute top-8 -left-6 w-0.5 h-full transition-none group-last:hidden",
                lineColor,
                "max-lg:hidden",
              )}
            />
          )}

          {/* Bullet indicator */}
          {!hideBullet && (
            <div
              className={cn(
                "inline-block absolute z-10 top-2 -left-7 size-3 outline outline-background outline-[1rem] rounded-full",
                bulletColor,
                "max-lg:hidden",
              )}
            />
          )}

          <div className="relative">{children}</div>
        </div>
      </div>
    </li>
  );
};
