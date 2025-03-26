import type { ExtraStreamData } from "@convoform/db/src/schema";
import type { SubmitAnswer } from "@convoform/react";

import { AnimatePresence, motion } from "motion/react";
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
  const shouldShowAnswerInput = !isFormBusy && currentField;
  return (
    <motion.div
      className="h-full flex flex-col justify-center gap-y-4 max-lg:justify-start"
      layout="position"
      layoutDependency={isEmptyQuestion}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentField?.fieldName}
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          className="text-muted-foreground max-lg:mt-10 text-xl capitalize text-left"
        >
          {currentField?.fieldName}
        </motion.div>
      </AnimatePresence>
      <div className="mb-10 w-full whitespace-pre-line text-justify leading-6 text-2xl lg:leading-7 transition-colors duration-500">
        <AnimatePresence mode="wait">
          {isEmptyQuestion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <TypingCursor />
            </motion.div>
          )}
          {!isEmptyQuestion && (
            <motion.div
              style={{ color: fontColor }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="min-h-fit"
            >
              <TypingEffect text={currentQuestion} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        {shouldShowAnswerInput && (
          <motion.div
            className="w-full max-lg:mt-auto max-lg:pb-4"
            variants={{
              hidden: { opacity: 0, translateY: -20 },
              visible: { opacity: 1, translateY: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.25 }}
          >
            <DynamicAnswerInput
              fieldConfiguration={currentField.fieldConfiguration}
              currentField={currentField}
              submitAnswer={submitAnswer}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
