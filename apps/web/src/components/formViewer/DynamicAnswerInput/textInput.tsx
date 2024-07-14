import type { TextInputConfigSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { montserrat } from "@/app/fonts";
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
  const textPlaceHolder =
    inputConfiguration.placeholder ?? "Type answer here...";

  const formHook = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });

  const handleFormSubmit = async (formData: FormData) => {
    await submitAnswer(formData.answer);
    formHook.reset();
    formHook.setFocus("answer");
  };

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
                    className="w-full rounded-none border-0 border-b bg-transparent ps-0	text-xl focus-visible:ring-0 focus-visible:ring-transparent  focus-visible:ring-offset-0 lg:text-2xl"
                    placeholder={textPlaceHolder}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        formHook.handleSubmit(handleFormSubmit)();
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className={cn(
              "text-muted-foreground flex items-center justify-end pt-1 text-sm font-light max-lg:hidden",
              montserrat.className,
            )}
          >
            Press{" "}
            <span className="mx-1 flex items-center font-semibold">
              Shift + Enter <CornerDownLeft className="h-3 w-3 " />
            </span>{" "}
            for new line
          </div>
          <div className="mt-8 lg:hidden">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-lg text-xl font-semibold uppercase"
            >
              Answer
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
