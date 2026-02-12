"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { api } from "@/trpc/react";

import { initialState } from "./constants";
import type {
  GenerateFormModalProps,
  GeneratedField,
  State,
  Template,
} from "./types";

// Schema for form context input
export const generateFormSchema = z.object({
  formOverview: z
    .string()
    .min(50, "Please provide at least 50 characters")
    .max(500, "Description must be under 500 characters"),
});

export type FormInputData = z.infer<typeof generateFormSchema>;

export function useFormGeneration({
  onFormGenerated,
  open,
  setOpen,
  organizationId,
}: GenerateFormModalProps) {
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

  const { currentStep } = state;
  const isBusy =
    currentStep !== "idle" &&
    currentStep !== "completed" &&
    currentStep !== "error";

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

  return {
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
  };
}
