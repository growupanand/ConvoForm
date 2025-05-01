"use client";

import { Button, FormDescription, FormLabel, Switch } from "@convoform/ui";
import { FormControl, FormField, FormItem, FormMessage } from "@convoform/ui";
import { Input } from "@convoform/ui";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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

  const hasMinimumRequiredChoices = fields.length <= 2;
  const [hasOtherOption, setHasOtherOption] = useState(false);
  const allowMultiple = formHook.watch(
    "fieldConfiguration.inputConfiguration.allowMultiple",
  );

  // Initialize state based on existing options
  useEffect(() => {
    if (fields.some((field) => field.isOther)) {
      setHasOtherOption(true);
    }
  }, []);

  useEffect(() => {
    if (fields && fields.length === 0) {
      append({ value: "" });
      append({ value: "" });
    }
  }, [fields]);

  // Remove "Other" option when allowMultiple becomes true
  useEffect(() => {
    if (allowMultiple && hasOtherOption) {
      // Remove any "Other" option
      const otherIndex = fields.findIndex((field) => field.isOther);
      if (otherIndex !== -1) {
        remove(otherIndex);
        setHasOtherOption(false);
      }
    }
  }, [allowMultiple]);

  // Handle "Other" option toggle
  const handleOtherOptionToggle = (enabled: boolean) => {
    setHasOtherOption(enabled);

    if (enabled) {
      // Add an "Other" option
      append({ value: "Other", isOther: true });
    } else {
      // Remove any "Other" option
      const otherIndex = fields.findIndex((field) => field.isOther);
      if (otherIndex !== -1) {
        remove(otherIndex);
      }
    }
  };

  return (
    <div className="grid gap-4">
      {/* Allow Multiple Selection checkbox */}
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.allowMultiple"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2">
            <div className="space-y-0.5">
              <FormLabel className="text-sm cursor-pointer">
                Allow multiple selections
              </FormLabel>
              <FormDescription className="text-xs">
                Let respondents select more than one option
              </FormDescription>
              <FormMessage />
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2">
        <div className="space-y-0.5">
          <FormLabel
            className={`text-sm ${
              allowMultiple ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            Allow "Other" option
          </FormLabel>
          <FormDescription
            className={`text-xs ${allowMultiple ? "opacity-50" : ""}`}
          >
            Add a text field option for custom responses
            {allowMultiple && " (only available for single selection)"}
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={hasOtherOption}
            onCheckedChange={handleOtherOptionToggle}
            disabled={allowMultiple}
          />
        </FormControl>
      </FormItem>

      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.options"
        render={() => (
          <FormItem className="space-y-6 mt-6">
            {fields.map((field, index) => (
              <div key={field.id} className="mb-2">
                <FormField
                  control={formHook.control}
                  name={`fieldConfiguration.inputConfiguration.options.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4 relative group">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Type a choice name"
                            disabled={fields[index]?.isOther}
                            maxLength={100}
                            showValueCount
                          />
                        </FormControl>
                        <Button
                          className="absolute -right-4 -top-4 hidden group-hover:block"
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => remove(index)}
                          disabled={
                            hasMinimumRequiredChoices || fields[index]?.isOther
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      {fields[index]?.isOther && (
                        <FormDescription className="mt-1 ml-1 text-xs">
                          This is the "Other" option with a text field
                        </FormDescription>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
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
