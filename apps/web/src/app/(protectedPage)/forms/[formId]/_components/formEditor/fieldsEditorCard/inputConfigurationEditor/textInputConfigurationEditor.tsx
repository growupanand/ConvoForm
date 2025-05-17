import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Switch,
} from "@convoform/ui";
import { Input } from "@convoform/ui";
import type { UseFormReturn } from "react-hook-form";

import { OptionalText } from ".";
import type { FormHookData } from "../editFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
};

export function TextInputConfigurationEditor({ formHook }: Readonly<Props>) {
  return (
    <>
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.isParagraph"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start justify-between rounded-lg border p-2">
            <FormLabel className="text-sm cursor-pointer">
              Paragraph Mode
            </FormLabel>
            <FormControl className="!mt-0">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
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
    </>
  );
}
