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

      <div className="text-sm space-y-1 border p-2 rounded-xl">
        <h4 className="font-medium text-base mb-2">Free plan limits</h4>
        <div>
          <span>Allowed file types:</span>
          <div className="inline-flex gap-2 ms-2">
            <Badge variant="secondary">JPG</Badge>
            <Badge variant="secondary">JPEG</Badge>
            <Badge variant="secondary">PDF</Badge>
          </div>
        </div>
        <div>
          <span>Maximum file size:</span>
          <span className="font-medium"> 5MB per file</span>
        </div>
        <div>
          <span>Files per response:</span>
          <span className="font-medium"> 1 file maximum</span>
        </div>

        <div>
          <span>Storage limit:</span>
          <span className="font-medium"> 100MB per organization</span>
        </div>
        <div>
          <span>File retention:</span>
          <span className="font-medium"> 30 days</span>
        </div>
      </div>
    </>
  );
}
