import * as React from "react";

import { cn } from "../lib/utils";
import { Input, type InputProps } from "./ui/input";

const HeadingInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        className={cn(
          "hover:border-input h-auto ps-0 border-transparent bg-transparent font-semibold ring-0 focus-visible:ring-0 text-xl",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
HeadingInput.displayName = "HeadingInput";

export { HeadingInput };
