"use client";

import { useRouter } from "next/navigation";
import { Workspace } from "@convoform/db";
import { Button } from "@convoform/ui/components/ui/button";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { formCreateSchema } from "@/lib/validations/form";
import { api } from "@/trpc/client";

type Props = {
  workspace: Workspace;
};

const newFormData = formCreateSchema.parse({
  name: "New form",
  welcomeScreenTitle: "",
  welcomeScreenMessage: "",
  welcomeScreenCTALabel: "",
  overview: "",
  formField: [
    {
      fieldName: "",
    },
  ],
});

export default function CreateFormButton({ workspace }: Readonly<Props>) {
  const router = useRouter();
  const createForm = api.form.create.useMutation({
    onSuccess: async (newForm) => {
      toast({
        title: "Form created",
        duration: 1500,
      });
      router.push(`/forms/${newForm.id}`);
    },
    onError: () => {
      toast({
        title: "Unable to create form",
      });
    },
  });
  const { isLoading } = createForm;

  const handleCreateForm = () =>
    createForm.mutateAsync({
      ...newFormData,
      workspaceId: workspace.id,
      organizationId: workspace.organizationId,
    });

  return (
    <Button
      variant="secondary"
      disabled={isLoading}
      onClick={handleCreateForm}
      className={cn(montserrat.className, "font-semibold")}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && <Plus className="mr-2 h-4 w-4" />}
      New Form
    </Button>
  );
}
