"use client";

import { type Workspace, newFormSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui";
import { sonnerToast } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { Loader2, PenLine, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";

import { api } from "@/trpc/react";
import { isRateLimitErrorResponse } from "@convoform/rate-limiter";
import { GenerateFormModal } from "./generateFormModal";

type Props = {
  workspace: Workspace;
};

export type HandleCreateForm = (
  formData: z.infer<typeof newFormSchema>,
) => Promise<void>;

const newFormFields: z.infer<typeof newFormSchema>["formFields"] = [
  {
    fieldName: "Name",
    fieldDescription: "Description of the field",
    fieldConfiguration: {
      inputType: "text",
      inputConfiguration: {},
    },
  },
];

const newFormData: z.infer<typeof newFormSchema> = newFormSchema.parse({
  name: "New form",
  welcomeScreenTitle: "Welcome to your new form!",
  welcomeScreenMessage: "Customize your form.",
  welcomeScreenCTALabel: "Start",
  overview:
    "This is brief description about the form, which will be used while generating questions.",
  formFields: newFormFields,
  formFieldsOrders: [],
});

export default function CreateFormButton({ workspace }: Readonly<Props>) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const createForm = api.form.create.useMutation({
    onSuccess: async (newForm) => {
      router.push(`/forms/${newForm.id}`);
    },
    onError: (error) => {
      if (isRateLimitErrorResponse(error)) {
        toast({
          title: "Rate limit exceeded",
          duration: 1500,
          variant: "destructive",
          description: error.message,
        });
      }
    },
  });
  const { isPending: isCreatingForm } = createForm;

  const handleCreateForm: HandleCreateForm = async (formData) => {
    const createFormPromise = createForm.mutateAsync({
      ...formData,
      workspaceId: workspace.id,
      organizationId: workspace.organizationId,
    });

    sonnerToast.promise(createFormPromise, {
      loading: "Creating form...",
      success: "Form created successfully",
      error: "Failed to create form",
    });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="cursor-pointer font-semibold font-montserrat"
          >
            {isCreatingForm && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!isCreatingForm && <Plus className="mr-2 h-4 w-4" />}
            <span>New Form</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" p-3" align="start">
          <DropdownMenuGroup className="grid gap-2">
            <DropdownMenuItem
              className="cursor-pointer px-3 font-semibold font-montserrat"
              disabled={isCreatingForm}
              onClick={() => handleCreateForm(newFormData)}
            >
              <PenLine size={16} className="mr-2" />
              <span>Blank form</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isCreatingForm}
              className="cursor-pointer px-3 font-semibold font-montserrat"
              onClick={() => setOpen(true)}
            >
              <Sparkles size={16} className="mr-2" />

              <span>Generate by AI</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <GenerateFormModal
        isCreatingForm={isCreatingForm}
        onFormGenerated={handleCreateForm}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
}
