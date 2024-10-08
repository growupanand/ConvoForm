"use client";

import type {
  ExtraStreamData,
  FormDesignRenderSchema,
} from "@convoform/db/src/schema";
import type { SubmitAnswer } from "@convoform/react";
import { Tally1 } from "lucide-react";

import { DynamicAnswerInput } from "./DynamicAnswerInput";

type Props = {
  isFormBusy: boolean;
  currentQuestion: string;
  submitAnswer: SubmitAnswer;
  currentField: ExtraStreamData["currentField"];
  formDesign: FormDesignRenderSchema;
};

export const AskScreen = ({
  isFormBusy,
  currentQuestion,
  submitAnswer,
  currentField,
  formDesign,
}: Props) => {
  return (
    <div className="flex min-h-full w-full flex-col justify-center px-3 ">
      <div className="text-muted-foreground mb-4 text-lg font-normal capitalize">
        {currentField?.fieldName}
      </div>
      <h1
        style={{ color: formDesign.fontColor }}
        className="mb-10 w-full whitespace-break-spaces text-justify text-xl leading-6 lg:text-2xl lg:leading-7 transition-colors duration-500"
      >
        <span>
          {currentQuestion}
          {isFormBusy && <Tally1 className="ml-2 inline animate-ping" />}
        </span>
      </h1>

      {!isFormBusy && currentField && (
        <div className="w-full">
          <DynamicAnswerInput
            fieldConfiguration={currentField.fieldConfiguration}
            currentField={currentField}
            submitAnswer={submitAnswer}
          />
        </div>
      )}
    </div>
  );
};
