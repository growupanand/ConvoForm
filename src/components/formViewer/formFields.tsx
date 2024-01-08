import { ChangeEvent } from "react";
import { CornerDownLeft, Tally1 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type Props = {
  isFormBusy: boolean;
  handleFormSubmit: (event: any) => void;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  input: string;
  currentQuestion: string;
};

export const FormFieldsViewer = ({
  isFormBusy,
  handleFormSubmit,
  handleInputChange,
  input,
  currentQuestion,
}: Props) => {
  return (
    <form onSubmit={handleFormSubmit}>
      <div className="w-full min-h-full flex flex-col items-center justify-center px-3 ">
        <h1 className="text-4xl font-medium mb-10 w-full ">
          <span>
            {currentQuestion}
            {isFormBusy && <Tally1 className="animate-ping inline ml-2" />}
          </span>
        </h1>
        {!isFormBusy && (
          <div className="w-full">
            <Textarea
              autoFocus
              className="text-xl focus-visible:ring-transparent	focus-visible:ring-0 w-full border-0  border-b rounded-none"
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
            <div className="text-sm font-light text-muted-foreground flex justify-end items-center max-lg:hidden pt-1">
              Press
              <span className="font-bold flex items-center mx-1">
                Shift + Enter <CornerDownLeft className="w-3 h-3 " />
              </span>
              for new line
            </div>
            <div className="py-3 ">
              <div className="lg:hidden">
                <Button
                  type="submit"
                  className="font-medium px-6 py-3 rounded-md w-full"
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
