"use client";

import { useEffect, useState } from "react";
import { Form } from "@convoform/db";

import { useConvoForm } from "@/hooks/useConvoForm/useConvoForm";
import { CONVERSATION_START_MESSAGE } from "@/lib/constants";
import Spinner from "../common/spinner";
import { EndScreen } from "./endScreen";
import { FormFieldsViewer } from "./formFields";
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

export function FormViewer({ form, refresh, isPreview }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
  });

  const { formStage: currentStage } = state;

  const {
    currentQuestion,
    isFirstQuestion,
    submitAnswer,
    isLoading,
    endScreenMessage,
    handleGoToPrevQuestion,
    resetForm,
    isReady,
  } = useConvoForm({ isPreview, formId: form.id });

  const hidePrevQuestionButton = isFirstQuestion;

  const gotoStage = (newStage: FormStage) => {
    setState((cs) => ({ ...cs, formStage: newStage }));
  };

  const handleCTAClick = () => {
    submitAnswer(CONVERSATION_START_MESSAGE);
    gotoStage("conversationFlow");
  };

  useEffect(() => {
    setState((cs) => ({ ...cs, formStage: "welcomeScreen" }));
    resetForm();
  }, [form, refresh]);

  if (!isReady) {
    return <Spinner label="Loading..." />;
  }

  return (
    <div className="container max-w-[800px]">
      {currentStage === "welcomeScreen" && (
        <WelcomeScreen form={form} onCTAClick={handleCTAClick} />
      )}

      {currentStage === "conversationFlow" && (
        <FormFieldsViewer
          currentQuestion={currentQuestion}
          isFormBusy={isLoading}
          handleGoToPrevQuestion={handleGoToPrevQuestion}
          hidePrevQuestionButton={hidePrevQuestionButton}
          submitAnswer={submitAnswer}
        />
      )}
      {currentStage === "endScreen" && (
        <EndScreen endScreenMessage={endScreenMessage} />
      )}
    </div>
  );
}
