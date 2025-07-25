import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui";
import { Input } from "@convoform/ui";
import { Badge } from "@convoform/ui";
import type { UseFormReturn } from "react-hook-form";

import { ToggleButton } from "@/components/common/toggleButton";
import { OptionalText } from ".";
import type { FormHookData } from "../editFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
};

export function FileUploadInputConfiguration({ formHook }: Readonly<Props>) {
  return (
    <>
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.helpText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Help Text <OptionalText />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. Please upload your resume or portfolio"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <FormLabel>File Restrictions (Beta Limits)</FormLabel>
        <div className="text-sm text-muted-foreground space-y-2">
          <div>
            <span className="font-medium">Maximum file size:</span> 5MB per file
          </div>
          <div>
            <span className="font-medium">Files per response:</span> 1 file
            maximum
          </div>
          <div>
            <span className="font-medium">Allowed file types:</span>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">JPG</Badge>
              <Badge variant="secondary">JPEG</Badge>
              <Badge variant="secondary">PDF</Badge>
            </div>
          </div>
          <div>
            <span className="font-medium">Storage limit:</span> 100MB per
            organization
          </div>
          <div>
            <span className="font-medium">File retention:</span> 30 days
          </div>
        </div>
      </div>

      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.isRequired"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ToggleButton
                className="w-full justify-between"
                label="Required Field"
                id="required-field"
                switchProps={{
                  checked: field.value || false,
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
