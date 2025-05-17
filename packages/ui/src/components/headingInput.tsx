import { cn } from "../lib/utils";
import { Input, type InputProps } from "./ui/input";

const HeadingInput = ({ className, ...props }: InputProps) => {
  return (
    <Input
      className={cn(
        " h-auto ps-0 hover:ps-2 hover:border-input focus-visible:ps-2 border-transparent bg-transparent  font-semibold text-lg",
        className,
      )}
      {...props}
    />
  );
};

HeadingInput.displayName = "HeadingInput";

export { HeadingInput };
