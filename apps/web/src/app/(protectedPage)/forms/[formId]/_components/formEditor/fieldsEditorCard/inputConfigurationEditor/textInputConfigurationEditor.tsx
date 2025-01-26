import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
