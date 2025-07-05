import { cn } from "../../lib/utils";

type Props = {
  children: React.ReactNode;
  className?: HTMLElement["className"];
};

export function MutedText({ children, className }: Props) {
  return (
    <span className={cn("text-muted-foreground text-sm", className)}>
      {children}
    </span>
  );
}
