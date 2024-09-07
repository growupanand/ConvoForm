import { cn } from "@/lib/utils";
import { SIZES_MAP } from "./constants";

export type DotSize = keyof typeof SIZES_MAP;

type Props = {
  className?: string;
  size?: DotSize;
};

export function Dot({ className, size = "md" }: Readonly<Props>) {
  return (
    <div
      className={cn(
        "bg-primary size-2 rounded-full",
        SIZES_MAP[size],
        className,
      )}
    />
  );
}

export default Dot;
