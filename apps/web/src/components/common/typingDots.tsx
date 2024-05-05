import Dot from "@/components/common/dot";
import { cn } from "@/lib/utils";
import { SIZES_MAP } from "./constants";

export type DotSize = keyof typeof SIZES_MAP;

type Props = {
  dotClassName?: string;
  size?: DotSize;
};

export function AnimatedTypingDots({
  dotClassName,
  size = "md",
}: Readonly<Props>) {
  return (
    <div className="flex items-center gap-1">
      <Dot
        size={size}
        className={cn("animate-bounce-lg delay-0", dotClassName)}
      ></Dot>
      <Dot
        size={size}
        className={cn(" animate-bounce-lg   delay-150", dotClassName)}
      ></Dot>
      <Dot
        size={size}
        className={cn("  animate-bounce-lg   delay-300", dotClassName)}
      ></Dot>
    </div>
  );
}
