"use client";

import { Button, Card, CardContent } from "@convoform/ui";
import { AlertCircle, CheckCircle2, Loader2, Wand2 } from "lucide-react";
import { motion } from "motion/react";
import type { GenerationStep } from "./types";

type StatusCardsProps = {
  currentStep: GenerationStep;
  error?: string;
  onRetry?: () => void;
  onClose?: () => void;
};

export function StatusCards({
  currentStep,
  error,
  onRetry,
  onClose,
}: StatusCardsProps) {
  // Processing status
  if (
    currentStep === "generating-fields" ||
    currentStep === "generating-metadata" ||
    currentStep === "saving-form"
  ) {
    return (
      <Card className="border-brand-200 bg-brand-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-brand-700">
            <Wand2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentStep === "generating-fields" &&
                "Creating form fields based on your description..."}
              {currentStep === "generating-metadata" &&
                "Generating form title, description and messages..."}
              {currentStep === "saving-form" && "Saving your new form..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success status
  if (currentStep === "completed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-lg font-semibold text-green-700 mb-2">
          Form Generated Successfully!
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your AI-generated form is ready. Redirecting you to edit it...
        </p>
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">
            Opening form editor...
          </span>
        </div>
      </motion.div>
    );
  }

  // Error status
  if (currentStep === "error" && error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-red-800">
                  Generation Failed
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="flex-1">
              Try Again
            </Button>
          )}
          {onClose && (
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}
