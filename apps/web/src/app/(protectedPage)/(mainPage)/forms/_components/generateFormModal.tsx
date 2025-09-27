"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
} from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { api } from "@/trpc/react";

// Import our new components
import { FieldReviewStep } from "./generateFormModal/FieldReviewStep";
import { FormInput } from "./generateFormModal/FormInput";
import { ProgressSteps } from "./generateFormModal/ProgressSteps";
import { StatusCards } from "./generateFormModal/StatusCards";
import { TemplateSelection } from "./generateFormModal/TemplateSelection";
import { initialState } from "./generateFormModal/constants";
import type {
  GenerateFormModalProps,
  GeneratedField,
  State,
  Template,
} from "./generateFormModal/types";

// Schema for form context input
const generateFormSchema = z.object({
  formOverview: z
    .string()
    .min(50, "Please provide at least 50 characters")
    .max(500, "Description must be under 500 characters"),
});

type FormInputData = z.infer<typeof generateFormSchema>;

export function GenerateFormModal({
  onFormGenerated,
  open,
  setOpen,
  organizationId,
}: Readonly<GenerateFormModalProps>) {
  const [state, setState] = useState<State>(initialState);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [formContext, setFormContext] = useState<string>("");

  // Load form templates from API
  const { data: templates, isLoading: isLoadingTemplates } =
    api.aiFormGeneration.getTemplates.useQuery();

  // AI form generation mutations
  const generateFieldsMutation =
    api.aiFormGeneration.generateFields.useMutation();
  const generateMetadataMutation =
    api.aiFormGeneration.generateMetadata.useMutation();
  const createFormMutation =
    api.aiFormGeneration.createFormFromFields.useMutation();

  const { currentStep, progress, error, generatedFields } = state;
  const isBusy =
    currentStep !== "idle" &&
    currentStep !== "completed" &&
    currentStep !== "error";
  const isCompleted = currentStep === "completed";
  const hasError = currentStep === "error";

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setState(initialState);
      setSelectedTemplateId(null);
      setFormContext("");
    }
  }, [open]);

  const form = useForm<FormInputData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      formOverview: "",
    },
  });

  const formOverview = form.watch("formOverview");
  const characterCount = formOverview.length;
  const isValidLength = characterCount >= 50 && characterCount <= 500;

  async function onSubmit(formData: FormInputData) {
    try {
      setFormContext(formData.formOverview);

      // Step 1: Generate form fields
      setState({
        currentStep: "generating-fields",
        progress: 10,
        error: undefined,
      });

      const fieldsResult = await generateFieldsMutation.mutateAsync({
        formContext: formData.formOverview,
        maxFields: 8,
      });

      // Step 2: Show field review
      setState({
        currentStep: "reviewing-fields",
        progress: 30,
        error: undefined,
        generatedFields: fieldsResult.fields,
        selectedFields: fieldsResult.fields,
      });
    } catch (error: any) {
      let errorMessage =
        "Failed to generate form fields. Please try again with a different description.";

      if (error?.message) {
        errorMessage = error.message;
      }

      setState({ currentStep: "error", progress: 0, error: errorMessage });
    }
  }

  const handleTemplateSelect = (template: Template) => {
    form.setValue("formOverview", template.context);
    setSelectedTemplateId(template.id);
  };

  const handleFieldsConfirmed = async (confirmedFields: GeneratedField[]) => {
    try {
      // Step 3: Generate form metadata
      setState({
        currentStep: "generating-metadata",
        progress: 60,
        error: undefined,
        selectedFields: confirmedFields,
      });

      const metadataResult = await generateMetadataMutation.mutateAsync({
        formContext,
        selectedFields: confirmedFields,
      });

      // Step 4: Create the complete form
      setState({
        currentStep: "saving-form",
        progress: 85,
        error: undefined,
      });

      const formResult = await createFormMutation.mutateAsync({
        formName: metadataResult.formName,
        formDescription: metadataResult.formDescription,
        welcomeScreenTitle: metadataResult.welcomeScreenTitle,
        welcomeScreenMessage: metadataResult.welcomeScreenMessage,
        endingMessage: metadataResult.endingMessage,
        selectedFields: confirmedFields,
        organizationId,
      });

      setState({
        currentStep: "completed",
        progress: 100,
        error: undefined,
      });

      // Redirect to the new form after a brief delay
      setTimeout(async () => {
        if (formResult.success && formResult.form) {
          await onFormGenerated?.({
            ...formResult.form,
            formFields: formResult.form.formFields || [],
            isAIGenerated: true,
            isPublished: false,
          });
        }
      }, 1500);
    } catch (error: any) {
      let errorMessage = "Failed to generate form. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      }

      setState({ currentStep: "error", progress: 0, error: errorMessage });
    }
  };

  const handleBackToEdit = () => {
    setState({
      currentStep: "idle",
      progress: 0,
      error: undefined,
      generatedFields: undefined,
      selectedFields: undefined,
    });
  };

  const handleRetry = () => {
    setState(initialState);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
                setState(initialState);
                setSelectedTemplateId(null);
                setFormContext("");
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
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <TemplateSelection
                    templates={templates}
                    isLoading={isLoadingTemplates}
                    selectedTemplateId={selectedTemplateId}
                    onTemplateSelect={handleTemplateSelect}
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
                      onClick={() => setOpen(false)}
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
