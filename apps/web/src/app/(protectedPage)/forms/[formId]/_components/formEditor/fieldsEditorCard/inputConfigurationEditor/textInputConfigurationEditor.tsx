import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { UseFormReturn } from "react-hook-form";

import { FormHookData } from "../editFieldSheet";

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
            <FormLabel>Placeholder (optional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Custom placeholder text" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
