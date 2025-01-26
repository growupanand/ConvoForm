"use client";

import { Button } from "@convoform/ui";
import { FormControl, FormField, FormItem, FormMessage } from "@convoform/ui";
import { Input } from "@convoform/ui";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";

import type { FormHookData } from "../editFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
};

export function MultiChoiceInputConfiguration({ formHook }: Readonly<Props>) {
  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: "fieldConfiguration.inputConfiguration.options",
  });

  const isLastTwoChoice = fields.length <= 2;

  useEffect(() => {
    if (fields && fields.length === 0) {
      append({ value: "" });
      append({ value: "" });
    }
  }, [fields]);

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
                        <Input {...field} placeholder="Type a choice name" />
                      </FormControl>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(index)}
                        disabled={isLastTwoChoice}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </FormItem>
        )}
      />

      <div className="mt-2">
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => append({ value: "" })}
        >
          <Plus className="mr-2 size-4" /> Add choice
        </Button>
      </div>
    </div>
  );
}
