import type React from "react";
import { cn } from "src/lib/utils";

type HeadingProps = {
  children: React.ReactNode;
  description?: string;
  className?: string;
};

export function SectionHeading({
  children,
  description,
  className,
}: HeadingProps) {
  return (
    <div className={cn("space-y-2 text- px-4 mb-4", className)}>
      <div className="font-medium text-lg tracking-tight">{children}</div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
