import { cn } from "@/lib/utils";

export function SectionContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("lg:container lg:max-w-[1200px]", className)}>
      {children}
    </div>
  );
}
