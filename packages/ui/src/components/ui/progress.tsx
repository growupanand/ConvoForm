"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";
import { cn } from "../../lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    children?: React.ReactNode;
    showLabel?: boolean;
    indicatorClassName?: string;
    trackClassName?: string;
    textClassName?: string;
  }
>(
  (
    {
      className,
      value,
      children,
      showLabel = false,
      indicatorClassName,
      trackClassName,
      textClassName,
      ...props
    },
    ref,
  ) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-10 w-full overflow-hidden rounded-lg outline outline-muted-foreground/50 outline-1",
        trackClassName || "bg-transparent",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full flex items-center duration-2000 transition-all ease-in-out",
          indicatorClassName || "bg-muted-foreground/50",
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
      {children && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-4",
            textClassName || "text-white",
          )}
        >
          {children}
        </div>
      )}
      {showLabel && !children && (
        <div className="absolute inset-0 flex items-center justify-end px-4">
          <span className={cn("text-sm font-medium", textClassName)}>
            {value}%
          </span>
        </div>
      )}
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
