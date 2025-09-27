"use client";

import { Button } from "@convoform/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui";
import { Textarea } from "@convoform/ui";
import { Progress } from "@convoform/ui";
import { Card, CardContent } from "@convoform/ui";
import { Badge } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { useAutoHeightHook } from "@/hooks/auto-height-hook";
import { api } from "@/trpc/react";
import type {
  Form as DBForm,
  FormField as DBFormField,
} from "@convoform/db/src/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@convoform/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui";

// Schema for form context input
const generateFormSchema = z.object({
  formOverview: z
    .string()
    .min(50, "Please provide at least 50 characters")
    .max(500, "Description must be under 500 characters"),
});

type Props = {
  onFormGenerated?: (
    form: DBForm & {
      formFields: DBFormField[];
    },
  ) => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
  organizationId: string;
};

type GenerationStep =
  | "idle"
  | "generating-fields"
  | "generating-metadata"
  | "saving-form"
  | "completed"
  | "error";

type State = {
  currentStep: GenerationStep;
  progress: number;
  error?: string;
};

const initialState: State = {
  currentStep: "idle",
  progress: 0,
  error: undefined,
};

const steps = [
  {
    id: "generating-fields",
    label: "Generating form fields",
    icon: Wand2,
    progress: 33,
  },
  {
    id: "generating-metadata",
    label: "Creating form details",
    icon: FileText,
    progress: 66,
  },
  { id: "saving-form", label: "Saving your form", icon: Save, progress: 100 },
] as const;

// Templates are now loaded from API

export function GenerateFormModal({
  onFormGenerated,
  open,
  setOpen,
  organizationId,
}: Readonly<Props>) {
  const [state, setState] = useState<State>(initialState);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

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

  const { currentStep, progress, error } = state;
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
    }
  }, [open]);
  const form = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      formOverview: "",
    },
  });

  const formOverview = form.watch("formOverview");
  const { inputRef } = useAutoHeightHook({ value: formOverview });
  const characterCount = formOverview.length;
  const isValidLength = characterCount >= 50 && characterCount <= 500;

  async function onSubmit(formData: z.infer<typeof generateFormSchema>) {
    try {
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

      // Step 2: Generate form metadata
      setState({
        currentStep: "generating-metadata",
        progress: 50,
        error: undefined,
      });

      const metadataResult = await generateMetadataMutation.mutateAsync({
        formContext: formData.formOverview,
        selectedFields: fieldsResult.fields,
      });

      // Step 3: Create the complete form
      setState({ currentStep: "saving-form", progress: 80, error: undefined });

      const formResultPromise = createFormMutation.mutateAsync({
        formName: metadataResult.formName,
        formDescription: metadataResult.formDescription,
        welcomeScreenTitle: metadataResult.welcomeScreenTitle,
        welcomeScreenMessage: metadataResult.welcomeScreenMessage,
        endingMessage: metadataResult.endingMessage,
        selectedFields: fieldsResult.fields,
        organizationId,
      });

      const formResult = await formResultPromise;

      setState({ currentStep: "completed", progress: 100, error: undefined });

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
      let errorMessage =
        "Failed to generate form. Please try again with a different description.";

      if (error?.message) {
        errorMessage = error.message;
      }

      setState({ currentStep: "error", progress: 0, error: errorMessage });
    }
  }

  const handleTemplateSelect = (template: {
    id: string;
    name: string;
    context: string;
  }) => {
    form.setValue("formOverview", template.context);
    setSelectedTemplateId(template.id);
  };

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
    <Dialog
      open={open}
      onOpenChange={
        isBusy
          ? undefined
          : (open) => {
              setOpen(open);
              if (!open) {
                form.reset();
                setState(initialState);
                setSelectedTemplateId(null);
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
          {isBusy && (
            <motion.div
              key="progress"
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

              {/* Current Step Description */}
              <Card className="border-brand-200 bg-brand-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-brand-700">
                    <Wand2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {currentStep === "generating-fields" &&
                        "Creating form fields based on your description..."}
                      {currentStep === "generating-metadata" &&
                        "Generating form title, description and messages..."}
                      {currentStep === "saving-form" &&
                        "Saving your new form..."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              key="success"
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
          )}

          {hasError && (
            <motion.div
              key="error"
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
                <Button
                  variant="outline"
                  onClick={() => setState(initialState)}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {!isBusy && !isCompleted && !hasError && (
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
                  {/* Templates Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-medium">
                        Quick Start Templates
                      </h3>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {isLoadingTemplates ? (
                        <div className="col-span-full text-sm text-muted-foreground">
                          Loading templates...
                        </div>
                      ) : templates && templates.length > 0 ? (
                        <>
                          {/* Show first 3 templates as cards */}
                          {templates.slice(0, 3).map((template) => (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card
                                className={`cursor-pointer transition-all hover:shadow-sm ${
                                  selectedTemplateId === template.id
                                    ? "ring-2 ring-brand-500 bg-brand-50"
                                    : "hover:bg-muted/30"
                                }`}
                                onClick={() => handleTemplateSelect(template)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      {template.name}
                                    </span>
                                    {selectedTemplateId === template.id && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}

                          {/* Show dropdown for remaining templates if there are more than 3 */}
                          {templates.length > 3 && (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Card className="cursor-pointer transition-all hover:shadow-sm hover:bg-muted/30">
                                    <CardContent className="p-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                          More Templates
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          +{templates.length - 3}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="w-56"
                                >
                                  <DropdownMenuGroup>
                                    {templates.slice(3).map((template) => (
                                      <DropdownMenuItem
                                        key={template.id}
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleTemplateSelect(template)
                                        }
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <span className="text-sm">
                                            {template.name}
                                          </span>
                                          {selectedTemplateId ===
                                            template.id && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs ml-2"
                                            >
                                              Selected
                                            </Badge>
                                          )}
                                        </div>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <div className="col-span-full text-sm text-muted-foreground">
                          No templates available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Description */}
                  <FormField
                    control={form.control}
                    name="formOverview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Describe Your Form
                        </FormLabel>
                        <FormDescription>
                          Provide a detailed description of the form you want to
                          create. The AI will generate appropriate fields based
                          on your description.
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-2">
                            <Textarea
                              {...field}
                              maxLength={500}
                              rows={6}
                              className="overflow-hidden resize-none"
                              placeholder="Example: I want to create a customer feedback form for my restaurant. It should collect customer name, email, rating for food quality, service quality, and overall experience, plus a text field for additional comments."
                              ref={(e) => {
                                field.ref(e);
                                inputRef.current = e;
                              }}
                            />
                            <div className="flex justify-between items-center text-xs">
                              <FormMessage />
                              <div
                                className={`transition-colors ${
                                  characterCount < 50
                                    ? "text-red-500"
                                    : characterCount > 450
                                      ? "text-amber-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {characterCount}/500 characters
                                {characterCount < 50 && (
                                  <span className="ml-1 text-red-500">
                                    (minimum 50 required)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

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
