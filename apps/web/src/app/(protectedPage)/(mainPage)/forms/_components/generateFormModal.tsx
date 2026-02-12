"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@convoform/ui";
import { Sparkles } from "lucide-react";
import { AnimatePresence } from "motion/react";

// Import our new components
import { FieldReviewStep } from "./generateFormModal/FieldReviewStep";
import { GeneratingStep } from "./generateFormModal/GeneratingStep";
import { PromptStep } from "./generateFormModal/PromptStep";
import { StatusCards } from "./generateFormModal/StatusCards";
import type { GenerateFormModalProps } from "./generateFormModal/types";
import { useFormGeneration } from "./generateFormModal/useFormGeneration";

export function GenerateFormModal(props: Readonly<GenerateFormModalProps>) {
  const { open, setOpen } = props;
  const {
    state,
    form,
    onSubmit,
    handleTemplateSelect,
    handleFieldsConfirmed,
    handleBackToEdit,
    handleRetry,
    handleClose,
    isBusy,
    templates,
    isLoadingTemplates,
    selectedTemplateId,
  } = useFormGeneration(props);

  const { currentStep, progress, error, generatedFields } = state;

  const isCompleted = currentStep === "completed";
  const hasError = currentStep === "error";

  return (
    <Dialog
      open={open}
      onOpenChange={
        isBusy && currentStep !== "reviewing-fields"
          ? undefined
          : (open) => {
              setOpen(open);
              if (!open) {
                form.reset();
                handleRetry(); // This resets state to initial
              }
            }
      }
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-brand-500" /> Generate Form with AI
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Progress and Status Steps */}
          {(currentStep === "generating-fields" ||
            currentStep === "generating-metadata" ||
            currentStep === "saving-form") && (
            <GeneratingStep currentStep={currentStep} progress={progress} />
          )}

          {/* Field Review Step */}
          {currentStep === "reviewing-fields" && generatedFields && (
            <FieldReviewStep
              key="review"
              fields={generatedFields}
              onFieldsConfirmed={handleFieldsConfirmed}
              onBack={handleBackToEdit}
            />
          )}

          {/* Success State */}
          {isCompleted && (
            <StatusCards key="success" currentStep={currentStep} />
          )}

          {/* Error State */}
          {hasError && (
            <StatusCards
              key="error"
              currentStep={currentStep}
              error={error}
              onRetry={handleRetry}
              onClose={handleClose}
            />
          )}

          {/* Initial Form */}
          {currentStep === "idle" && (
            <PromptStep
              form={form}
              templates={templates}
              isLoadingTemplates={isLoadingTemplates}
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={handleTemplateSelect}
              onSubmit={onSubmit}
              onCancel={handleClose}
              isBusy={isBusy}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
