"use client";

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
import { ChevronLeft, CornerDownLeft, Tally1 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props = {
  isFormBusy: boolean;
  currentQuestion: string;
  handleGoToPrevQuestion: () => string;
  showPrevQuestionButton: boolean;
  submitAnswer: (answer: string) => Promise<void>;
};

const formSchema = z.object({
  answer: z.string().min(1).max(255),
});

export const FormFieldsViewer = ({
  isFormBusy,
  currentQuestion,
  handleGoToPrevQuestion,
  showPrevQuestionButton,
  submitAnswer,
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { answer } = values;
    await submitAnswer(answer);
    form.reset();
    form.setFocus("answer");
  }

  function goToPrevQuestion() {
    const prevAnswer = handleGoToPrevQuestion();
    form.setValue("answer", prevAnswer);
    form.setFocus("answer");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className={cn("py-3", showPrevQuestionButton && "hidden")}>
          <Button
            type="button"
            variant="ghost"
            className={cn("rounded-full", montserrat.className)}
            size="sm"
            onClick={goToPrevQuestion}
            disabled={isFormBusy}
          >
            <ChevronLeft className="mr-2" size={20} />
            <span>Back to Previous</span>
          </Button>
        </div>
        <div className="flex min-h-full w-full flex-col items-center justify-center px-3 ">
          <h1 className="mb-10 w-full text-4xl font-medium ">
            <span>
              {currentQuestion}
              {isFormBusy && <Tally1 className="ml-2 inline animate-ping" />}
            </span>
          </h1>

          {!isFormBusy && (
            <div className="w-full">
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        autoFocus
                        className="w-full rounded-none border-0 border-b	bg-transparent text-xl focus-visible:ring-0  focus-visible:ring-transparent focus-visible:ring-offset-0"
                        placeholder="Type answer here..."
                        disabled={isFormBusy}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-muted-foreground flex items-center justify-end pt-1 text-sm font-light max-lg:hidden">
                Press{" "}
                <span className="mx-1 flex items-center font-bold">
                  Shift + Enter <CornerDownLeft className="h-3 w-3 " />
                </span>{" "}
                for new line
              </div>
              <div className="py-3 ">
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    className="w-full rounded-md px-6 py-3 font-medium "
                  >
                    Answer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};
