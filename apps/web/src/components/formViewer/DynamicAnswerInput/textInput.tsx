"use client";

import type { TextInputConfigSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui";
import { Textarea } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAutoHeightHook } from "@/hooks/auto-height-hook";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { InputProps } from "./";

type Props = InputProps & {
  inputConfiguration: TextInputConfigSchema;
};

const formSchema = z.object({
  answer: z.string().min(1).max(255),
});

export type FormData = z.infer<typeof formSchema>;

export function TextInput({
  submitAnswer,
  inputConfiguration,
}: Readonly<Props>) {
  const [isMobile] = useMediaQuery("(max-width: 1024px)");
  const textPlaceHolder = inputConfiguration.placeholder ?? "Type here...";

  const formHook = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });

  const answerText = formHook.watch("answer");

  const handleFormSubmit = async (formData: FormData) => {
    await submitAnswer(formData.answer);
    formHook.reset();
    formHook.setFocus("answer");
  };

  const { inputRef } = useAutoHeightHook({ value: answerText });

  return (
    <Form {...formHook}>
      <form onSubmit={formHook.handleSubmit(handleFormSubmit)}>
        <div>
          <FormField
            control={formHook.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    autoFocus
                    rows={inputConfiguration.isParagraph ? 4 : 1}
                    className={cn(
                      "w-full  text-2xl",
                      !inputConfiguration.isParagraph
                        ? "rounded-none border-0 bg-transparent ps-0	 focus-visible:ring-0 focus-visible:ring-transparent  focus-visible:ring-offset-0"
                        : "",
                    )}
                    placeholder={textPlaceHolder}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        // On desktop: Enter submits, Shift+Enter adds new line
                        if (!isMobile) {
                          if (!event.shiftKey) {
                            event.preventDefault();
                            formHook.handleSubmit(handleFormSubmit)();
                          }
                          // If Shift+Enter, do nothing (default behavior adds a new line)
                        }
                        // On mobile: Enter always adds a new line (default behavior)
                      }
                    }}
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      inputRef.current = e;
                    }}
                  />
                </FormControl>
                <FormMessage />
                {!isMobile && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Press Enter to submit or Shift+Enter for a new line
                  </p>
                )}
              </FormItem>
            )}
          />
          <div className="mt-8 lg:hidden">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-lg text-xl h-auto py-2 font-medium"
            >
              Answer
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
