"use client";

import { useEffect, useState } from "react";
import { Form } from "@convoform/db";
import { useConvoForm } from "@convoform/react";
import { showErrorResponseToast } from "@convoform/ui/components/ui/use-toast";

import { CONVERSATION_START_MESSAGE } from "@/lib/constants";
import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
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
  const showCustomEndScreenMessage = form.showCustomEndScreenMessage;
  const customEndScreenMessage = form.customEndScreenMessage || undefined;
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
    isFormFinished,
  } = useConvoForm({
    isPreview,
    formId: form.id,
    showCustomEndScreenMessage,
    customEndScreenMessage,
    onError: (error) => {
      let errorMessage;
      try {
        if (isRateLimitErrorResponse(error)) {
          errorMessage = error.message ?? "Rate limit exceeded";
        } else {
          errorMessage = JSON.parse(error.message).nonFieldError;
        }
      } catch (_) {
        errorMessage = undefined;
      }
      showErrorResponseToast(error, errorMessage);
    },
  });

  const hidePrevQuestionButton = isFirstQuestion;

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
    if (isFormFinished) {
      gotoStage("endScreen");
    }
  }, [isFormFinished]);

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
