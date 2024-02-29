"use client";

import { Form } from "@convoform/db";
import { Input } from "@convoform/ui/components/ui/input";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { isRateLimitError } from "@/lib/errorHandlers";
import { cn, debounce } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExtractFieldErrors } from "@/trpc/utils";

type Props = {
  form: Form;
  className?: string;
};

//TODO: create reusable component for this

export default function ChangeNameInput({ form, className }: Props) {
  const queryClient = useQueryClient();
  const updateForm = api.form.patch.useMutation({
    onSuccess: () => {
      toast({
        title: "Form name updated.",
        duration: 1500,
      });
      queryClient.invalidateQueries({
        queryKey: [["form", "getOneWithWorkspace"]],
      });
    },
    throwOnError: false,
    onError: (error) => {
      const { name: nameFieldError } = ExtractFieldErrors(error);
      toast({
        title: "Unable to update Form's Name",
        duration: 2000,
        variant: "destructive",
        description: isRateLimitError(error)
          ? error.message
          : nameFieldError ?? undefined,
      });
    },
  });
  const isUpdating = updateForm.isPending;

  const updateWorkspace = async (name: string) =>
    updateForm.mutateAsync({
      id: form.id,
      name,
    });

  const handleFormNameInputChange = async (e: any) => {
    const updatedName = e.target.value as string;
    debounce(() => updateWorkspace(updatedName), 1000);
  };

  return (
    <Input
      disabled={isUpdating}
      className={cn(
        "rounded-none border-0 bg-transparent text-2xl font-bold hover:border-b hover:border-gray-300 focus-visible:border-b focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0",
        className,
      )}
      type="text"
      defaultValue={form.name}
      onChange={handleFormNameInputChange}
    />
  );
}
