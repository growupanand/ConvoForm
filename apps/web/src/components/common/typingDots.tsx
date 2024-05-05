import Dot from "@/components/common/dot";
import { cn } from "@/lib/utils";
import { SIZES_MAP } from "./constants";

export type DotSize = keyof typeof SIZES_MAP;

type Props = {
  dotClassName?: string;
  size?: DotSize;
  animate?: boolean;
  className?: string;
};

export function AnimatedTypingDots({
  dotClassName,
  size = "md",
  animate = true,
  className,
}: Readonly<Props>) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Dot
        size={size}
        className={cn(
          "delay-0",
          animate && "animate-bounce-lg",

          dotClassName,
        )}
      ></Dot>
      <Dot
        size={size}
        className={cn(
          " delay-150",
          animate && "animate-bounce-lg",
          dotClassName,
        )}
      ></Dot>
      <Dot
        size={size}
        className={cn(
          "delay-300",
          animate && "animate-bounce-lg",
          dotClassName,
        )}
      ></Dot>
    </div>
  );
}
