import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui";
import { Input } from "@convoform/ui";
import type { UseFormReturn } from "react-hook-form";

import { ToggleButton } from "@/components/common/toggleButton";
import { OptionalText } from ".";
import type { FormHookData } from "../useFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
};

export function TextInputConfigurationEditor({ formHook }: Readonly<Props>) {
  return (
    <>
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Placeholder <OptionalText />
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Type placeholder text" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.isParagraph"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ToggleButton
                className="w-full justify-between"
                label="Paragraph Mode"
                id="paragraph-mode"
                switchProps={{
                  checked: field.value,
                  onCheckedChange: field.onChange,
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
