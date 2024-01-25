"use client";

import { useState } from "react";
import { Form } from "@prisma/client";
import { useAtom } from "jotai";

import { Input } from "@/components/ui/input";
import { currentFormAtom } from "@/lib/atoms/formAtoms";
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

  const [, setCurrentForm] = useAtom(currentFormAtom);

  const updateWorkspace = async (name: string) => {
    setState((cs) => ({ ...cs, isUpdating: true }));
    try {
      await patchFormController(form.id, { name });
      toast({
        title: "Form name updated.",
        duration: 1500,
      });
      setCurrentForm({
        ...form,
        name,
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
      defaultValue={formName}
      onChange={handleFormNameInputChange}
    />
  );
}
