"use client";

import { useEffect, useState } from "react";
import { Form } from "@convoform/db";
import { useNewConvoForm } from "@convoform/react";

import { CONVERSATION_START_MESSAGE } from "@/lib/constants";
import { EndScreen } from "./endScreen";
import { FormFieldsViewer } from "./FormFieldsViewer";
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

export function FormViewer({
  form,
  refresh,
  // isPreview
}: Readonly<Props>) {
  // const showCustomEndScreenMessage = form.showCustomEndScreenMessage;
  // const customEndScreenMessage = form.customEndScreenMessage || undefined;
  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
  });

  const { formStage: currentStage } = state;

  const {
    submitAnswer,
    currentQuestion,
    isBusy,
    isFormSubmissionFinished,
    endScreenMessage,
  } = useNewConvoForm({
    formId: form.id,
  });

  // TODO: Implement this
  // const hidePrevQuestionButton = isFirstQuestion;

  const gotoStage = (newStage: FormStage) => {
    setState((cs) => ({ ...cs, formStage: newStage }));
  };

  const handleCTAClick = () => {
    submitAnswer(CONVERSATION_START_MESSAGE);
    gotoStage("conversationFlow");
  };

  useEffect(() => {
    gotoStage("welcomeScreen");
    // resetForm();
  }, [form, refresh]);

  useEffect(() => {
    if (isFormSubmissionFinished) {
      gotoStage("endScreen");
    }
  }, [isFormSubmissionFinished]);

  return (
    <div className="container max-w-[800px]">
      {currentStage === "welcomeScreen" && (
        <WelcomeScreen form={form} onCTAClick={handleCTAClick} />
      )}

      {currentStage === "conversationFlow" && (
        <FormFieldsViewer
          currentQuestion={currentQuestion}
          isFormBusy={isBusy}
          // handleGoToPrevQuestion={handleGoToPrevQuestion}
          // hidePrevQuestionButton={hidePrevQuestionButton}
          submitAnswer={submitAnswer}
        />
      )}
      {currentStage === "endScreen" && (
        <EndScreen endScreenMessage={endScreenMessage} />
      )}
    </div>
  );
}
