"use client";

import type { Form } from "@convoform/db/src/schema";
import { Input } from "@convoform/ui/components/ui/input";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { cn, debounce } from "@/lib/utils";
import { api } from "@/trpc/react";
import { isRateLimitErrorResponse } from "@convoform/rate-limiter";

type Props = {
  form: Form;
  className?: string;
};

//TODO: create reusable component for this

export default function ChangeNameInput({ form, className }: Props) {
  const queryClient = useQueryClient();
  const updateForm = api.form.patch.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form", "getOneWithWorkspace"]],
      });
    },
    throwOnError: false,
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
  const isUpdating = updateForm.isPending;

  const handleUpdateForm = (name: string) => {
    const updateFormPromise = updateForm.mutateAsync({
      id: form.id,
      name,
    });

    sonnerToast.promise(updateFormPromise, {
      loading: "Saving changes...",
      success: "Form name saved successfully",
      error: "Unable to update form name",
    });
  };

  const handleFormNameInputChange = (e: any) => {
    const updatedName = e.target.value as string;
    debounce(() => handleUpdateForm(updatedName), 1000);
  };

  return (
    <Input
      disabled={isUpdating}
      className={cn(
        " border-transparent  bg-transparent text-2xl font-bold hover:bg-white focus:bg-white  ",
        className,
      )}
      type="text"
      defaultValue={form.name}
      onChange={handleFormNameInputChange}
    />
  );
}
