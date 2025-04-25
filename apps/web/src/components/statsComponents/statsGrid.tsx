import { cn } from "@/lib/utils";

type StatsGridProps = {
  children: React.ReactNode;
  className?: string;
  minWidth?: string; // Control minimum width per card
  gap?: number; // Control grid gap
};

export function StatsGrid({
  children,
  className,
  minWidth = "200px",
  gap = 6,
}: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid",
        `gap-x-${gap}`,
        "gap-y-6", // Add specific vertical gap
        className,
      )}
      style={{
        // This creates a responsive grid that maintains minimum width
        // and auto-flows to new rows as needed
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        // For screens large enough, limit max columns
      }}
    >
      {children}
    </div>
  );
}
