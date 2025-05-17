import type React from "react";
import { cn } from "src/lib/utils";

type HeadingProps = {
  children: React.ReactNode;
  description?: React.ReactNode;
  className?: HTMLElement["className"];
};

export function SectionHeading({
  children,
  description,
  className,
}: HeadingProps) {
  return (
    <div className={cn("space-y-2 px-4 mb-2", className)}>
      <div className="font-medium text-lg tracking-tight ">{children}</div>
      {description && (
        <div className="text-muted-foreground text-xs">{description}</div>
      )}
    </div>
  );
}
