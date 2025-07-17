import type React from "react";
import { cn } from "src/lib/utils";

type HeadingProps = {
  children: React.ReactNode;
  description?: React.ReactNode;
  className?: HTMLElement["className"];
  titleClassName?: HTMLElement["className"];
};

export function SectionHeading({
  children,
  description,
  className,
  titleClassName,
}: HeadingProps) {
  return (
    <div className={cn(" mb-4", className)}>
      <div
        className={cn("font-medium text-lg tracking-tight ", titleClassName)}
      >
        {children}
      </div>
      {description && (
        <div className="text-subtle-foreground text-sm">{description}</div>
      )}
    </div>
  );
}
