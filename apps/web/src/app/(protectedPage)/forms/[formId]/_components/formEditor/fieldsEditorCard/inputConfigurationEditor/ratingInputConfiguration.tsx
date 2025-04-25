// Create a new file: apps/web/src/app/(protectedPage)/forms/[formId]/_components/formEditor/fieldsEditorCard/inputConfigurationEditor/ratingInputConfiguration.tsx

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@convoform/ui";
import type { UseFormReturn } from "react-hook-form";
import type { FormHookData } from "../editFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
};

export function RatingInputConfiguration({ formHook }: Readonly<Props>) {
  const { control } = formHook;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="fieldConfiguration.inputConfiguration.maxRating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Rating</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={3}
                max={10}
                {...field}
                onChange={(e) =>
                  field.onChange(Number.parseInt(e.target.value, 10) || 5)
                }
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fieldConfiguration.inputConfiguration.lowLabel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Low Rating Label</FormLabel>
            <FormControl>
              <Input placeholder="Poor" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fieldConfiguration.inputConfiguration.highLabel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>High Rating Label</FormLabel>
            <FormControl>
              <Input placeholder="Excellent" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fieldConfiguration.inputConfiguration.iconType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icon Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "STAR"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="STAR">Stars</SelectItem>
                <SelectItem value="HEART">Hearts</SelectItem>
                <SelectItem value="THUMB_UP">Thumbs Up</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fieldConfiguration.inputConfiguration.requireConfirmation"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <FormLabel className="text-base">Require Confirmation</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
