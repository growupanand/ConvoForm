"use client";

import { Progress } from "@convoform/ui";
import { Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { steps } from "./constants";
import type { GenerationStep } from "./types";

type ProgressStepsProps = {
  currentStep: GenerationStep;
  progress: number;
};

export function ProgressSteps({ currentStep, progress }: ProgressStepsProps) {
  const renderProgressStep = (step: (typeof steps)[number], index: number) => {
    const isActive = currentStep === step.id;
    const isCompleted = progress > step.progress || currentStep === "completed";
    const StepIcon = step.icon;

    return (
      <motion.div
        key={step.id}
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div
          className={`
          flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
          ${
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : isActive
                ? "bg-brand-500 border-brand-500 text-white"
                : "bg-muted border-muted-foreground/30 text-muted-foreground"
          }
        `}
        >
          {isCompleted ? (
            <Check className="w-4 h-4" />
          ) : isActive ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <StepIcon className="w-4 h-4" />
          )}
        </div>
        <span
          className={`text-sm font-medium transition-colors ${
            isCompleted
              ? "text-green-600"
              : isActive
                ? "text-brand-600"
                : "text-muted-foreground"
          }`}
        >
          {step.label}
        </span>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Progress Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Progress
          </h3>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Details */}
      <div className="space-y-4">{steps.map(renderProgressStep)}</div>
    </motion.div>
  );
}
