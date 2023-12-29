import { ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Tally1 } from "lucide-react";

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
          <Input
            autoFocus
            className="text-2xl border-0 focus-visible:ring-transparent	 focus-visible:ring-0 w-full"
            onChange={handleInputChange}
            type="text"
            placeholder="Type here..."
            value={input}
            disabled={isFormBusy}
          />
        )}
      </div>
    </form>
  );
};
