import type { ExtraStreamData } from "@convoform/db/src/schema";
import type { SubmitAnswer } from "@convoform/react";

import { AnimatePresence, motion } from "framer-motion";
import { TypingCursor, TypingEffect } from "../common/typingEffect";
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
  const isEmptyQuestion = currentQuestion.trim().length === 0;
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full py-20 h-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ duration: 0.5 }}
            key={currentField?.fieldName}
            className="text-muted-foreground mb-4 text-xl capitalize text-left"
          >
            {currentField?.fieldName}
          </motion.div>
        </AnimatePresence>
        <div className="mb-10 w-full whitespace-pre-line text-justify leading-6 text-2xl lg:leading-7 transition-colors duration-500">
          <AnimatePresence mode="wait">
            {!isEmptyQuestion && (
              <motion.div
                style={{ color: fontColor }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TypingEffect text={currentQuestion} />
              </motion.div>
            )}
          </AnimatePresence>
          {isEmptyQuestion && <TypingCursor />}
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
