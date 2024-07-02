import { MultipleChoiceInputConfigSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";

import { InputProps } from "./";

type Props = InputProps & {
  inputConfiguration: MultipleChoiceInputConfigSchema;
};

export function MultiChoiceInput({
  inputConfiguration,
  submitAnswer,
}: Readonly<Props>) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-x-10">
      {inputConfiguration.options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => submitAnswer(option.value)}
        >
          {option.value}
        </Button>
      ))}
    </div>
  );
}
