"use client";

import { Button, toast } from "@convoform/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui";
import { Textarea } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle2, Pen, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import Spinner from "@/components/common/spinner";
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
  formOverview: z.string().min(50).max(500),
});

type Props = {
  onFormGenerated?: (
    form: DBForm & {
      formFields: DBFormField[];
    },
  ) => Promise<void>;
  isCreatingForm: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  organizationId: string;
};

type State = {
  isGeneratingForm: boolean;
  isGeneratingFormData: boolean;
  isSavingForm: boolean;
  isGeneratedForm: boolean;
};

const initialState = {
  isGeneratingFormData: false,
  isGeneratingForm: false,
  isSavingForm: false,
  isGeneratedForm: false,
} as State;

// Templates are now loaded from API

export function GenerateFormModal({
  onFormGenerated,
  isCreatingForm,
  open,
  setOpen,
  organizationId,
}: Readonly<Props>) {
  const [state, setState] = useState<State>(initialState);

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
  const {
    isGeneratingFormData,
    isGeneratingForm,
    isSavingForm,
    isGeneratedForm,
  } = state;
  const isBusy =
    isCreatingForm || isGeneratingFormData || isSavingForm || isGeneratingForm;
  const form = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      formOverview: "",
    },
  });

  const formOverview = form.watch("formOverview");
  const { inputRef } = useAutoHeightHook({ value: formOverview });

  async function onSubmit(formData: z.infer<typeof generateFormSchema>) {
    setState({
      ...initialState,
      isGeneratingForm: true,
      isGeneratingFormData: true,
      isSavingForm: true,
    });

    try {
      // Step 1: Generate form fields
      setState((cs) => ({ ...cs, isGeneratingFormData: true }));
      const fieldsResult = await generateFieldsMutation.mutateAsync({
        formContext: formData.formOverview,
        maxFields: 8,
      });

      // Step 2: Generate form metadata
      const metadataResult = await generateMetadataMutation.mutateAsync({
        formContext: formData.formOverview,
        selectedFields: fieldsResult.fields,
      });

      setState((cs) => ({
        ...cs,
        isGeneratingFormData: false,
        isSavingForm: true,
      }));

      // Step 3: Create the complete form
      const formResultPromise = createFormMutation.mutateAsync({
        formName: metadataResult.formName,
        formDescription: metadataResult.formDescription,
        welcomeScreenTitle: metadataResult.welcomeScreenTitle,
        welcomeScreenMessage: metadataResult.welcomeScreenMessage,
        endingMessage: metadataResult.endingMessage,
        selectedFields: fieldsResult.fields,
        organizationId,
      });

      toast.promise(formResultPromise, {
        loading: "Creating form...",
        success: "Form created successfully",
        error: "Failed to create form",
      });

      const formResult = await formResultPromise;
      setState((cs) => ({
        ...cs,
        isSavingForm: false,
        isGeneratedForm: true,
      }));

      // Redirect to the new form
      if (formResult.success && formResult.form) {
        await onFormGenerated?.({
          ...formResult.form,
          formFields: formResult.form.formFields || [],
          isAIGenerated: true,
          isPublished: false,
        });
      }
    } catch (error: any) {
      let errorMessage =
        "Failed to generate form. Please try again with a different description.";

      if (error?.message) {
        errorMessage = error.message;
      }

      form.setError("formOverview", {
        type: "manual",
        message: errorMessage,
      });
      setState(initialState);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={isGeneratingFormData ? undefined : setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-brand-500" /> Generate by AI
          </DialogTitle>
        </DialogHeader>
        {isBusy && (
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              {isGeneratingFormData ? (
                <Spinner />
              ) : (
                <Check className="text-brand-500" />
              )}
              Generate fields
            </div>
            <div className="flex items-center gap-2">
              {isSavingForm ? (
                <Spinner />
              ) : (
                <Check className="text-brand-500" />
              )}
              Save form
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            {!isBusy && (
              <>
                <FormField
                  control={form.control}
                  name="formOverview"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription>
                        Form fields will be auto-generated based on your brief
                        description
                      </FormDescription>
                      <FormMessage />
                      <FormControl>
                        <Textarea
                          {...field}
                          maxLength={500}
                          rows={5}
                          className="overflow-hidden"
                          placeholder="Explain here or choose one of the templates"
                          ref={(e) => {
                            field.ref(e);
                            inputRef.current = e;
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex items-center mb-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Pen className="mr-2 size-4" />
                        Choose Template
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuGroup>
                        {templates?.map((template) => (
                          <DropdownMenuItem
                            key={template.id}
                            className="cursor-pointer"
                            onClick={() => {
                              form.setValue("formOverview", template.context);
                            }}
                          >
                            {template.name}
                          </DropdownMenuItem>
                        )) || (
                          <DropdownMenuItem disabled>
                            {isLoadingTemplates
                              ? "Loading..."
                              : "No templates available"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}

            {isGeneratedForm && (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-6 fill-green-100 stroke-green-500" />
                <span>Generated form successfully</span>
              </div>
            )}

            {!isGeneratedForm && (
              <Button type="submit" disabled={isBusy}>
                <span>
                  {isGeneratingForm ? "Generating..." : "Generate Form"}
                </span>
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
