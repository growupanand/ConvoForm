import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
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
