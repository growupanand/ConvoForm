"use client";

import { useState } from "react";
import { Form } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { patchFormController } from "@/lib/controllers/form";
import { cn, debounce } from "@/lib/utils";
import { toast } from "../ui/use-toast";

type Props = {
  form: Form;
  className?: string;
};

type State = {
  formName: string;
  isUpdating: boolean;
};

//TODO: create reusable component for this

export default function FormNameInput({ form, className }: Props) {
  const [state, setState] = useState<State>({
    formName: form.name,
    isUpdating: false,
  });
  const { formName, isUpdating } = state;

  const updateWorkspace = async (name: string) => {
    setState((cs) => ({ ...cs, isUpdating: true }));
    try {
      await patchFormController(form.id, { name });
      toast({
        title: "Form name updated.",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Unable to update form name",
        duration: 1500,
      });
    } finally {
      setState((cs) => ({ ...cs, isUpdating: false }));
    }
  };

  const handleFormNameInputChange = async (e: any) => {
    const updatedName = e.target.value as string;
    e.target.style.width = `${updatedName.length + 1}ch`;
    debounce(() => updateWorkspace(updatedName), 1000);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        disabled={isUpdating}
        className={cn(
          "max-w-[400px] border-0 bg-transparent text-2xl font-bold focus-visible:ring-0 focus-visible:ring-transparent",
          className,
        )}
        style={{
          width: `${formName.length + 2}ch`,
        }}
        type="text"
        defaultValue={formName}
        onChange={handleFormNameInputChange}
      />
    </div>
  );
}
