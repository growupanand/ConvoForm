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
      <div className="w-full min-h-full flex flex-col items-center justify-center">
        <h1 className="w-full px-3 text-4xl font-medium mb-10">
          {!isFormBusy && currentQuestion}
          {isFormBusy && <Tally1 className="animate-ping" />}
        </h1>
        {!isFormBusy && (
          <Input
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
