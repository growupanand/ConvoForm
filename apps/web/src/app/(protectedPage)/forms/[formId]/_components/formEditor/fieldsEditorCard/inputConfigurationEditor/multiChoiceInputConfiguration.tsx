"use client";

import { Button, FormDescription } from "@convoform/ui";
import { FormControl, FormField, FormItem, FormMessage } from "@convoform/ui";
import { Input } from "@convoform/ui";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";

import { cn } from "@/lib/utils";
import type { FormHookData } from "../editFieldSheet";
import { ToggleButton } from "@/components/common/toggleButton";

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
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.options"
        render={() => (
          <FormItem className="space-y-6">
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
                            maxLength={fields[index]?.isOther ? undefined : 100}
                            showValueCount
                          />
                        </FormControl>
                        <Button
                          className={cn(
                            "absolute -right-2 -top-2 hidden group-hover:block",
                            hasMinimumRequiredChoices || fields[index]?.isOther
                              ? "group-hover:hidden"
                              : "",
                          )}
                          type="button"
                          size="xs"
                          variant="destructive"
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
      <FormItem>
        <FormControl className="!mt-0">
          <ToggleButton
            className="w-full justify-between"
            label="Allow 'Other' option"
            id="allow-other-option"
            switchProps={{
              checked: hasOtherOption,
              onCheckedChange: handleOtherOptionToggle,
              disabled: allowMultiple,
            }}
          />
        </FormControl>
      </FormItem>
      {/* Allow Multiple Selection checkbox */}
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.allowMultiple"
        render={({ field }) => (
          <FormItem>
            <FormControl className="!mt-0">
              <ToggleButton
                className="w-full justify-between"
                label="Allow multiple selections"
                id="allow-multiple-selections"
                switchProps={{
                  checked: field.value,
                  onCheckedChange: field.onChange,
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
