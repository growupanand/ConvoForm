"use client";

import { forwardRef, useRef } from "react";

import { cn } from "../../lib/utils";
import { Badge } from "./badge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showValueCount?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showValueCount, value, ...props }, ref) => {
    // Create an internal ref
    const internalRef = useRef<HTMLInputElement>(null);

    // Use ref passed or the internal ref fallback
    const combinedRef = ref || internalRef;

    const inputValueCount =
      (combinedRef as React.RefObject<HTMLInputElement>)?.current?.value
        .length ?? 0;
    const maxValueCount = props.maxLength ?? 0;

    return (
      <div className="relative group w-full">
        <input
          type={type}
          className={cn(
            "transition-[padding,box-shadow] border-input ring-offset-background placeholder:text-muted-foreground  flex  h-10 w-full rounded-md border bg-white hover:bg-white focus-visible:bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          value={value === null ? "" : value}
          {...props}
          ref={combinedRef}
        />
        {showValueCount && (
          <Badge
            variant="outline"
            className={cn(
              "hidden group-hover:block absolute left-2 -top-1 -translate-y-1/2 rounded bg-gray-400 border-gray-400 font-semibold text-white",
              maxValueCount === inputValueCount && "bg-red-500 border-red-500",
            )}
          >
            {inputValueCount}
            {maxValueCount ? ` / ${maxValueCount} Max` : ""}
          </Badge>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
