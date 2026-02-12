"use client";

import { motion } from "motion/react";

import { ProgressSteps } from "./ProgressSteps";
import { StatusCards } from "./StatusCards";
import type { GenerationStep } from "./types";

interface GeneratingStepProps {
  currentStep: GenerationStep;
  progress: number;
}

export function GeneratingStep({ currentStep, progress }: GeneratingStepProps) {
  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <ProgressSteps currentStep={currentStep} progress={progress} />
      <StatusCards currentStep={currentStep} />
    </motion.div>
  );
}
