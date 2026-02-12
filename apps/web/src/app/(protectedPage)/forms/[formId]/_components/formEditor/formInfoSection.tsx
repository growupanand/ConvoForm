import { cn } from "@/lib/utils";
import type {
  FormField as FormFieldSchema,
  updateFormSchema,
} from "@convoform/db/src/schema";
import { FORM_SECTIONS_ENUMS } from "@convoform/db/src/schema/formDesigns/constants";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Label,
  MutedText,
  Textarea,
  Form as UIForm,
} from "@convoform/ui";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod/v4";
import { FieldsEditorCard } from "./fieldsEditorCard";
import type { HandleUpdateFieldsOrder } from "./useFormFieldsState";

type Props = {
  formHook: UseFormReturn<z.infer<typeof updateFormSchema>>;
  onSubmit: (formData: z.infer<typeof updateFormSchema>) => void;
  formFields: FormFieldSchema[];
  fieldsOrders: string[];
  formId: string;
  handleUpdateFieldsOrder: HandleUpdateFieldsOrder;
  isSavingForm: boolean;
};

export function FormInfoSection({
  formHook,
  onSubmit,
  formFields,
  fieldsOrders,
  formId,
  handleUpdateFieldsOrder,
  isSavingForm,
}: Props) {
  return (
    <AccordionItem
      value={FORM_SECTIONS_ENUMS.questionsScreen}
      className="border-b-muted"
    >
      <AccordionTrigger className={cn("group font-medium  hover:no-underline")}>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-md font-medium g-subtle group-data-[state=open]:bg-subtle-foreground group-data-[state=open]:text-white"
          >
            2
          </Badge>{" "}
          <span>Questions screen</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pe-0 ps-10 pt-1 space-y-4">
        <div>
          <UIForm {...formHook}>
            <form onSubmit={formHook.handleSubmit(onSubmit)}>
              <FormField
                control={formHook.control}
                name="overview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Overview</FormLabel>
                    <FormDescription>
                      This will help AI while generating questions.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write a brief description of what this form is for"
                        disabled={isSavingForm}
                        rows={5}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </UIForm>
        </div>
        <div className="grid space-y-2">
          <Label className="block">Questions</Label>
          <MutedText>
            Use shift + up or down to jump between questions
          </MutedText>
          <FieldsEditorCard
            formFields={formFields}
            formFieldsOrders={fieldsOrders}
            formId={formId}
            handleUpdateFieldsOrder={handleUpdateFieldsOrder}
            isSavingForm={isSavingForm}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
