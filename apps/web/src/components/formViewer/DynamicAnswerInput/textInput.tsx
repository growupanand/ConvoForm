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
                    rows={1}
                    className="w-full rounded-none border-0 bg-transparent ps-0	 focus-visible:ring-0 focus-visible:ring-transparent  focus-visible:ring-offset-0 text-2xl"
                    placeholder={textPlaceHolder}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        formHook.handleSubmit(handleFormSubmit)();
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
