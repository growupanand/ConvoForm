"use client";

import type { RatingInputConfigSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { InputProps } from "./";

type Props = InputProps & {
  inputConfiguration: RatingInputConfigSchema;
};

export function RatingInput({
  inputConfiguration,
  submitAnswer,
}: Readonly<Props>) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const maxRating = inputConfiguration.maxRating || 5;
  const lowLabel = inputConfiguration.lowLabel || "Poor";
  const highLabel = inputConfiguration.highLabel || "Excellent";

  const handleRatingSelect = (value: number) => {
    setRating(value);

    if (!inputConfiguration.requireConfirmation) {
      submitAnswer(value.toString());
    }
  };

  const handleSubmit = () => {
    if (rating !== null) {
      submitAnswer(rating.toString());
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center gap-4">
        <div
          className="flex items-center justify-center gap-2 mb-2"
          onMouseLeave={() => setHoveredRating(null)}
        >
          {Array.from({ length: maxRating }, (_, index) => (
            <motion.button
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              type="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                bounce: 0.5,
                delay: index * 0.1,
              }}
              className="relative focus:outline-none"
              onClick={() => handleRatingSelect(index + 1)}
              onMouseEnter={() => setHoveredRating(index + 1)}
            >
              <Star
                size={40}
                className={`
                  transition-colors duration-200
                  ${
                    (hoveredRating !== null && index < hoveredRating) ||
                    (hoveredRating === null &&
                      rating !== null &&
                      index < rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                `}
              />
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between w-full px-2 text-sm text-gray-500">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>

        {inputConfiguration.requireConfirmation && (
          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={rating === null}
          >
            Confirm Rating
          </Button>
        )}
      </div>
    </div>
  );
}
