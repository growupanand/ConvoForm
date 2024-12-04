import type { ExtraStreamData } from "@convoform/db/src/schema";
import type { SubmitAnswer } from "@convoform/react";

import { TypingEffect } from "../common/typingEffect";
import { DynamicAnswerInput } from "./DynamicAnswerInput";

type Props = {
  isFormBusy: boolean;
  currentQuestion: string;
  submitAnswer: SubmitAnswer;
  currentField: ExtraStreamData["currentField"];
  fontColor?: string;
};

export const AskScreen = ({
  isFormBusy,
  currentQuestion,
  submitAnswer,
  currentField,
  fontColor,
}: Props) => {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full py-20 h-full relative">
        <div className="text-muted-foreground mb-4 text-xl capitalize text-left">
          {currentField?.fieldName}
        </div>
        <div
          style={{ color: fontColor }}
          className="mb-10 w-full whitespace-pre-line text-justify leading-6 text-2xl lg:leading-7 transition-colors duration-500"
        >
          <TypingEffect text={currentQuestion} />
        </div>

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
    </div>
  );
};
