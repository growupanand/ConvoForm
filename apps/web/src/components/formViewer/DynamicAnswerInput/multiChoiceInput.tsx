"use client";

import type { MultipleChoiceInputConfigSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";

import { type Variants, motion } from "framer-motion";
import type { InputProps } from "./";

type Props = InputProps & {
  inputConfiguration: MultipleChoiceInputConfigSchema;
};

const choiceButtonAnimationVariants: Variants = {
  initial: { scale: 0 },
  animate: (index: number) => ({
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
      delay: index * 0.4, // Stagger effect with index-based delay
    },
  }),
};

export function MultiChoiceInput({
  inputConfiguration,
  submitAnswer,
}: Readonly<Props>) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10">
      {inputConfiguration.options.map((option, index) => (
        <motion.span
          variants={choiceButtonAnimationVariants}
          key={option.value}
          initial="initial"
          animate="animate"
          custom={index}
        >
          <Button
            type="button"
            variant="outline"
            className="rounded-full shadow  w-full font-medium text-xl h-auto py-2 active:scale-100 max-lg:justify-start"
            onClick={() => submitAnswer(option.value)}
          >
            {option.value}
          </Button>
        </motion.span>
      ))}
    </div>
  );
}
