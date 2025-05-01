import * as React from "react";

import { cn } from "../../lib/utils";
import { Badge } from "./badge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showValueCount?: boolean;
}

const Input = ({ className, type, showValueCount, ...props }: InputProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputValueCount = inputRef.current?.value.length ?? 0;
  const maxValueCount = props.maxLength ?? 0;

  return (
    <div className="relative group w-full">
      <input
        type={type}
        className={cn(
          "border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex  h-10 w-full rounded-md border bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
        ref={inputRef}
      />
      {showValueCount && (
        <Badge
          variant="outline"
          className="hidden group-hover:block absolute -left-2 -bottom-8 -translate-y-1/2 bg-white font-normal text-muted-foreground"
        >
          {inputValueCount}
          {maxValueCount ? `/${maxValueCount} max` : ""}
        </Badge>
      )}
    </div>
  );
};

Input.displayName = "Input";

export { Input };
