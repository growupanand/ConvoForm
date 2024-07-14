"use client";

import { ExtraStreamData } from "@convoform/db/src/schema";
import { SubmitAnswer } from "@convoform/react";
import { Tally1 } from "lucide-react";

import { DynamicAnswerInput } from "./DynamicAnswerInput";

type Props = {
  isFormBusy: boolean;
  currentQuestion: string;
  submitAnswer: SubmitAnswer;
  currentField: ExtraStreamData["currentField"];
};

export const FormFieldsViewer = ({
  isFormBusy,
  currentQuestion,
  submitAnswer,
  currentField,
}: Props) => {
  return (
    <div className="flex min-h-full w-full flex-col justify-center px-3 ">
      <div className="text-muted-foreground mb-4 text-lg font-normal capitalize">
        {currentField?.fieldName}
      </div>
      <h1 className="mb-10 w-full whitespace-break-spaces text-justify text-xl leading-6 lg:text-2xl lg:leading-7">
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
