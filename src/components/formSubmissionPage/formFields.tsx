import { ChangeEvent } from "react";
import { ChevronLeft, CornerDownLeft, Tally1 } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type Props = {
  isFormBusy: boolean;
  handleFormSubmit: (event: any) => void;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  input: string;
  currentQuestion: string;
  handleShowPreviousQuestion: () => void;
  isFirstQuestion: boolean;
};

export const FormFieldsViewer = ({
  isFormBusy,
  handleFormSubmit,
  handleInputChange,
  input,
  currentQuestion,
  handleShowPreviousQuestion,
  isFirstQuestion,
}: Props) => {
  return (
    <form onSubmit={handleFormSubmit}>
      <div className={cn("py-3", isFirstQuestion && "hidden")}>
        <Button
          type="button"
          variant="ghost"
          className={cn("rounded-full", montserrat.className)}
          size="sm"
          onClick={handleShowPreviousQuestion}
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
            <Textarea
              autoFocus
              className="w-full rounded-none border-0 border-b	bg-transparent text-xl focus-visible:ring-0  focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder="Type answer here..."
              value={input}
              disabled={isFormBusy}
              onChange={(e) => {
                handleInputChange(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-end pt-1 text-sm font-light text-muted-foreground max-lg:hidden">
              Press
              <span className="mx-1 flex items-center font-bold">
                Shift + Enter <CornerDownLeft className="h-3 w-3 " />
              </span>
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
  );
};
