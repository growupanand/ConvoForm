"use client";

import type { MultipleChoiceInputConfigSchema } from "@convoform/db/src/schema";
import { Button, Checkbox, Input } from "@convoform/ui";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
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
  const allowMultiple = inputConfiguration.allowMultiple;
  const [otherValue, setOtherValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);

  console.log({
    otherValue,
    selectedOptions,
    "inputConfiguration.options": inputConfiguration.options,
  });

  // Handle option selection
  const handleOptionSelect = (option: { value: string; isOther?: boolean }) => {
    let newSelectedOptions: string[];

    if (allowMultiple) {
      // For checkbox-style questions
      if (selectedOptions.includes(option.value)) {
        // Remove option if already selected
        newSelectedOptions = selectedOptions.filter(
          (val) => val !== option.value,
        );
      } else {
        // Add option to selection
        newSelectedOptions = [...selectedOptions, option.value];
      }
    } else {
      // For radio-style questions, just set the single selection
      newSelectedOptions = [option.value];
    }

    setSelectedOptions(newSelectedOptions);
    setShowOtherInput(option.isOther || false);

    // Submit immediately if it's not an "Other" option
    if (!option.isOther && !allowMultiple) {
      if (allowMultiple) {
        submitAnswer(newSelectedOptions.join(", "));
      } else {
        submitAnswer(option.value);
      }
    }
  };

  // Submit the "Other" option value
  const confirmSubmit = () => {
    if (showOtherInput && !otherValue) {
      return;
    }

    if (allowMultiple) {
      if (!selectedOptions.length) {
        return;
      }

      submitAnswer(selectedOptions.join(", "));
      return;
    }

    submitAnswer(otherValue);
  };

  const getSubmitButtonDisabled = () => {
    if (showOtherInput) {
      return !otherValue;
    }
    if (allowMultiple) {
      return selectedOptions.length === 0;
    }
    return false;
  };

  return (
    <div>
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
              className="cursor-pointer flex items-center gap-x-2 w-full font-medium text-xl h-auto py-3 px-4 justify-start relative"
              type="button"
              variant={allowMultiple ? "outline" : "secondary"}
              onClick={() => handleOptionSelect(option)}
              asChild
            >
              <div className="w-full">
                {allowMultiple && (
                  <Checkbox
                    checked={selectedOptions.includes(option.value)}
                    id={`option-${index}`}
                    className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2"
                    // Remove the onCheckedChange handler
                  />
                )}
                <span
                  className={`block text-wrap ${allowMultiple ? "pl-8" : ""}`}
                >
                  {option.value}
                </span>
              </div>
            </Button>
          </motion.span>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {showOtherInput && (
          <Input
            type="text"
            placeholder="Please specify..."
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            className="w-full mb-2"
            autoFocus
          />
        )}
        <div className="flex justify-end">
          {(showOtherInput || allowMultiple) && (
            <Button
              className="max-lg:w-full h-auto py-4"
              onClick={confirmSubmit}
              disabled={getSubmitButtonDisabled()}
            >
              Confirm Answer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
