import { cn } from "@/lib/utils";
import type { updateFormSchema } from "@convoform/db/src/schema";
import { FORM_SECTIONS_ENUMS } from "@convoform/db/src/schema/formDesigns/constants";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Form as UIForm,
} from "@convoform/ui";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod/v4";

type Props = {
  formHook: UseFormReturn<z.infer<typeof updateFormSchema>>;
  onSubmit: (formData: z.infer<typeof updateFormSchema>) => void;
  isErrorInLandingPageFields: boolean | undefined;
  isSavingForm: boolean;
};

export function WelcomeScreenSection({
  formHook,
  onSubmit,
  isErrorInLandingPageFields,
  isSavingForm,
}: Props) {
  return (
    <AccordionItem
      value={FORM_SECTIONS_ENUMS.landingScreen}
      className="border-b-muted"
    >
      <AccordionTrigger
        className={cn(
          " group font-medium hover:no-underline ",
          isErrorInLandingPageFields && "text-red-500",
        )}
      >
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-md font-medium bg-subtle group-data-[state=open]:bg-subtle-foreground group-data-[state=open]:text-white"
          >
            1
          </Badge>{" "}
          <span>Landing screen</span>
        </div>
      </AccordionTrigger>
      <UIForm {...formHook}>
        <form onSubmit={formHook.handleSubmit(onSubmit)}>
          <AccordionContent className="space-y-4 pe-1 ps-10 pt-1">
            <FormField
              control={formHook.control}
              name="welcomeScreenTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Page Heading"
                      disabled={isSavingForm}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formHook.control}
              name="welcomeScreenMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Short message to display below heading"
                      disabled={isSavingForm}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formHook.control}
              name="welcomeScreenCTALabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button text</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Button text (E.g. Fill form, Get started)"
                      disabled={isSavingForm}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </form>
      </UIForm>
    </AccordionItem>
  );
}
