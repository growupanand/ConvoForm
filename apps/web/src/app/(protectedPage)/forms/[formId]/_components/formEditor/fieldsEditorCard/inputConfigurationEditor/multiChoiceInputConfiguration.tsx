"use client";

import { Button } from "@convoform/ui/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { Plus, X } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { FormHookData } from "../editFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
};

export function MultiChoiceInputConfiguration({ formHook }: Readonly<Props>) {
  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: "fieldConfiguration.inputConfiguration.options",
  });

  const isLastChoice = fields.length === 1;

  return (
    <div className="grid gap-2">
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.options"
        render={() => (
          <FormItem className="">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={formHook.control}
                name={`fieldConfiguration.inputConfiguration.options.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input {...field} placeholder="Enter a choice..." />
                      </FormControl>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => remove(index)}
                        disabled={isLastChoice}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-4">
        <Button size="sm" type="button" onClick={() => append({ value: "" })}>
          <Plus className="mr-2 size-4" /> Add choice
        </Button>
      </div>
    </div>
  );
}
