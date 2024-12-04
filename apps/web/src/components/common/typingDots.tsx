"use client";

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

import { type Variants, motion } from "framer-motion";

const dotVariants: Variants = {
  initial: {
    y: 0,
  },
  animate: (index: number) => ({
    y: [0, -5, 0], // Move up and back down
    transition: {
      delay: index * 0.2, // Stagger each dot with a small delay
      duration: 0.3,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      repeatDelay: 0.9, // Ensure only one dot is animating at a time
    },
  }),
};

export function AnimatedTypingDots({
  dotClassName,
  size = "md",
  animate = true,
  className,
}: Readonly<Props>) {
  return (
    <div
      className={cn("align-middle inline-flex items-center gap-1", className)}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          variants={animate ? dotVariants : undefined}
          initial="initial"
          animate="animate"
          custom={index}
        >
          <Dot className={cn(SIZES_MAP[size], dotClassName)} />
        </motion.div>
      ))}
    </div>
  );
}
