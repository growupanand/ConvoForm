import { ChangeEvent } from "react";
import { Input } from "../ui/input";
import { CornerDownLeft, Tally1 } from "lucide-react";
import { Button } from "../ui/button";

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
            <Input
              autoFocus
              className="text-xl border-0 focus-visible:ring-transparent	 focus-visible:ring-0 w-full pb-5 border-b rounded-none"
              onChange={handleInputChange}
              type="text"
              placeholder="Type answer here..."
              value={input}
              disabled={isFormBusy}
            />
            <div className="py-3 ">
              <div className="text-sm font-light text-muted-foreground flex items-center max-lg:hidden">
                press
                <span className="font-bold flex items-center mx-1">
                  Enter <CornerDownLeft className="w-4 h-4 " />
                </span>
                to submit answer
              </div>
              <div className="lg:hidden">
                <Button
                  type="submit"
                  className="font-medium px-6 py-3 rounded-md w-full"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
