"use client";

import { Button, Form } from "@convoform/ui";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";

import { FormInput } from "./FormInput";
import { TemplateSelection } from "./TemplateSelection";
import type { Template } from "./types";
import type { FormInputData } from "./useFormGeneration";

interface PromptStepProps {
  form: UseFormReturn<FormInputData>;
  templates: Template[] | undefined;
  isLoadingTemplates: boolean;
  selectedTemplateId: string | null;
  onTemplateSelect: (template: Template) => void;
  onSubmit: (formData: FormInputData) => Promise<void>;
  onCancel: () => void;
  isBusy: boolean;
}

export function PromptStep({
  form,
  templates,
  isLoadingTemplates,
  selectedTemplateId,
  onTemplateSelect,
  onSubmit,
  onCancel,
  isBusy,
}: PromptStepProps) {
  const formOverview = form.watch("formOverview");
  const characterCount = formOverview.length;
  const isValidLength = characterCount >= 50 && characterCount <= 500;

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TemplateSelection
            templates={templates}
            isLoading={isLoadingTemplates}
            selectedTemplateId={selectedTemplateId}
            onTemplateSelect={onTemplateSelect}
          />

          <FormInput form={form} characterCount={characterCount} />

          {/* Generate Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={!isValidLength || isBusy}
              className="flex-1"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Form with AI
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
