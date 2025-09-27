"use client";

import { newFormSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui";
import { toast } from "@convoform/ui";
import { Loader2, PenLine, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { z } from "zod/v4";

import { api } from "@/trpc/react";
import { GenerateFormModal } from "./generateFormModal";

type Props = {
  organizationId: string;
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

export default function CreateFormButton({ organizationId }: Readonly<Props>) {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleFormCreatedSuccess = useCallback(
    (form: { id: string }) => {
      router.push(`/forms/${form.id}`);
    },
    [router],
  );

  const createForm = api.form.create.useMutation({
    onSuccess: handleFormCreatedSuccess,
  });
  const { isPending: isCreatingForm } = createForm;

  const handleCreateBlankForm: HandleCreateForm = async (formData) => {
    const createFormPromise = createForm.mutateAsync({
      ...formData,
      organizationId,
    });

    toast.promise(createFormPromise, {
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
              onClick={() => handleCreateBlankForm(newFormData)}
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
        open={open}
        setOpen={setOpen}
        organizationId={organizationId}
        onFormGenerated={async ({ id }) => handleFormCreatedSuccess({ id })}
      />
    </div>
  );
}
