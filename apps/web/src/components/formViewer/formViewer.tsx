"use client";

import { useEffect, useState } from "react";
import { ExtraStreamData, Form } from "@convoform/db/src/schema";
import { useConvoForm } from "@convoform/react";

import { CONVERSATION_START_MESSAGE } from "@/lib/constants";
import { EndScreen } from "./endScreen";
import { FormFieldsViewer } from "./FormFieldsViewer";
import { TopProgressBar } from "./topProgressBar";
import { WelcomeScreen } from "./welcomeScreen";

type Props = {
  form: Form;
  refresh?: boolean;
  isPreview?: boolean;
};

type State = {
  formStage: FormStage;
};

export type FormStage = "welcomeScreen" | "conversationFlow" | "endScreen";

export function FormViewer({ form, refresh }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
  });

  const { formStage: currentStage } = state;

  const {
    submitAnswer,
    currentQuestion,
    isBusy,
    isFormSubmissionFinished,
    endScreenMessage: generatedEndScreenMessage,
    resetForm,
    currentField,
    collectedData,
  } = useConvoForm({
    formId: form.id,
  });

  const customEndScreenMessage = form.customEndScreenMessage || undefined;
  const endScreenMessage = form.showCustomEndScreenMessage
    ? customEndScreenMessage
    : generatedEndScreenMessage;

  const totalSubmissionProgress = getSubmissionProgress(collectedData);
  const shouldShowProgressBar = ["conversationFlow", "endScreen"].includes(
    currentStage,
  );
  const gotoStage = (newStage: FormStage) => {
    setState((cs) => ({ ...cs, formStage: newStage }));
  };

  const handleCTAClick = () => {
    submitAnswer(CONVERSATION_START_MESSAGE);
    gotoStage("conversationFlow");
  };

  useEffect(() => {
    gotoStage("welcomeScreen");
    resetForm();
  }, [form, refresh]);

  useEffect(() => {
    if (isFormSubmissionFinished) {
      gotoStage("endScreen");
    }
  }, [isFormSubmissionFinished]);

  return (
    <div className="container max-w-[800px]">
      {shouldShowProgressBar && (
        <TopProgressBar totalProgress={totalSubmissionProgress} />
      )}
      {currentStage === "welcomeScreen" && (
        <WelcomeScreen form={form} onCTAClick={handleCTAClick} />
      )}

      {currentStage === "conversationFlow" && (
        <FormFieldsViewer
          currentQuestion={currentQuestion}
          isFormBusy={isBusy}
          submitAnswer={submitAnswer}
          currentField={currentField}
        />
      )}
      {currentStage === "endScreen" && (
        <EndScreen endScreenMessage={endScreenMessage} />
      )}
    </div>
  );
}

function getSubmissionProgress(
  collectedData: ExtraStreamData["collectedData"],
) {
  const totalFieldsRequired = collectedData?.length ?? 0;
  const totalFieldsCollected =
    collectedData?.filter(({ fieldValue }) => Boolean(fieldValue)).length ?? 0;
  const totalProgress = (totalFieldsCollected / totalFieldsRequired) * 100;
  return totalProgress;
}
