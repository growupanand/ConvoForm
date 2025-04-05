import { cn } from "@/lib/utils";

type StatsGridProps = {
  children: React.ReactNode;
  columns?: number;
  className?: string;
  minWidth?: string; // Control minimum width per card
  gap?: number; // Control grid gap
};

export function StatsGrid({
  children,
  columns = 3,
  className,
  minWidth = "200px",
  gap = 6,
}: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-rows-[auto_min-content]",
        `gap-x-${gap}`,
        className,
      )}
      style={{
        // This creates a responsive grid that maintains minimum width
        // and auto-flows to new rows as needed
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        // For screens large enough, limit max columns
        maxWidth: `calc(${Number.parseInt(minWidth) * columns}px + ${(columns - 1) * gap * 0.25}rem)`,
      }}
    >
      {children}
    </div>
  );
}
