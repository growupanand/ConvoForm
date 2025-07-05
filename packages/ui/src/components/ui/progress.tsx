"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-lg outline outline-muted-foreground outline-1",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        primary: "bg-primary/20",
        secondary: "bg-emphasis/20",
        accent: "bg-accent/20",
        destructive: "bg-destructive/20",
        subtle:
          "bg-white transition-[border] duration-300 border border-transparent outline-muted-foreground/30 group-hover:border-muted",
      },
      size: {
        xs: "h-4 text-xs",
        sm: "h-6 text-xs",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
        xl: "h-16 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const indicatorVariants = cva(
  "h-full flex items-center duration-2000 transition-all ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-muted-foreground",
        primary: "bg-primary",
        secondary: "bg-emphasis",
        accent: "bg-accent",
        destructive: "bg-destructive",
        subtle: "bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const textOnIndicatorVariants = cva("", {
  variants: {
    variant: {
      default: "text-white",
      primary: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive-foreground",
      subtle: "text-secondary-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const textOnTrackVariants = cva("", {
  variants: {
    variant: {
      default: "text-foreground",
      primary: "text-foreground",
      secondary: "text-foreground",
      accent: "text-foreground",
      destructive: "text-foreground",
      subtle: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  children?: React.ReactNode;
  showLabel?: boolean;
  indicatorClassName?: string;
  trackClassName?: string;
  textClassName?: string;
  indicatorTextClassName?: string;
  trackTextClassName?: string;
}

function Progress({
  className,
  value,
  children,
  showLabel = false,
  indicatorClassName,
  trackClassName,
  textClassName,
  indicatorTextClassName,
  trackTextClassName,
  variant,
  size,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        progressVariants({ variant, size }),
        trackClassName,
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(indicatorVariants({ variant }), indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />

      {children && (
        <div className="absolute inset-0 flex items-center px-4">
          <div
            className="relative w-full flex items-center justify-between"
            style={{ clipPath: `inset(0 ${100 - (value || 0)}% 0 0)` }}
          >
            <div
              className={cn(
                textOnIndicatorVariants({ variant }),
                textClassName,
                indicatorTextClassName,
                "w-full flex items-center justify-between",
              )}
            >
              {children}
            </div>
          </div>

          <div
            className="absolute inset-0 flex items-center px-4"
            style={{ clipPath: `inset(0 0 0 ${value || 0}%)` }}
          >
            <div
              className={cn(
                textOnTrackVariants({ variant }),
                textClassName,
                trackTextClassName,
                "w-full flex items-center justify-between",
              )}
            >
              {children}
            </div>
          </div>
        </div>
      )}

      {showLabel && !children && (
        <div className="absolute inset-0 flex items-center justify-end px-4">
          <span
            className={cn(
              "font-medium",
              textOnTrackVariants({ variant }),
              textClassName,
            )}
          >
            {value}%
          </span>
        </div>
      )}
    </ProgressPrimitive.Root>
  );
}

Progress.displayName = ProgressPrimitive.Root.displayName;

export {
  Progress,
  progressVariants,
  indicatorVariants,
  textOnIndicatorVariants,
  textOnTrackVariants,
};
