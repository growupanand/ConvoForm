"use client";

import { useEffect, useState } from "react";
import { Form } from "@convoform/db";
import { showErrorResponseToast } from "@convoform/ui/components/ui/use-toast";
import { useChat } from "ai/react";

import { CONVERSATION_START_MESSAGE } from "@/lib/constants";
import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { EndScreen } from "./endScreen";
import { FormFieldsViewer } from "./formFields";
import { getCurrentQuestion, isFirstQuestion } from "./utils";
import { WelcomeScreen } from "./welcomeScreen";

type Props = {
  form: Form;
  refresh?: boolean;
  isPreview?: boolean;
};

type State = {
  formStage: FormStage;
  endScreenMessage: string;
};

export type FormStage = "welcomeScreen" | "conversationFlow" | "endScreen";

export function FormViewer({ form, refresh, isPreview }: Readonly<Props>) {
  const apiEndpoint = `/api/form/${form.id}/conversation`;

  const { showCustomEndScreenMessage, customEndScreenMessage } = form;

  const [state, setState] = useState<State>({
    formStage: "endScreen",
    endScreenMessage: "",
  });

  const { formStage: currentStage, endScreenMessage } = state;

  const { messages, append, data, setMessages, isLoading, setInput } = useChat({
    api: apiEndpoint,
    body: { isPreview },
    onError(error) {
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

  const currentQuestion = getCurrentQuestion(messages) ?? "";
  const showPrevQuestionButton = isFirstQuestion(messages);

  const submitAnswer = async (answer: string) => {
    if (!isLoading) {
      setState((s) => ({ ...s, isFormBusy: true }));
      await append({
        content: answer,
        role: "user",
      });
    }
  };

  const gotoStage = (newStage: FormStage) => {
    setState((cs) => ({ ...cs, formStage: newStage }));
  };

  const handleCTAClick = () => {
    setState((s) => ({ ...s, isFormBusy: true }));
    append({
      content: CONVERSATION_START_MESSAGE,
      role: "user",
    });
    gotoStage("conversationFlow");
  };

  // This will remove the current question and previous answer from the messages list of useChat hook
  // And return the previous answer string
  const handleGoToPrevQuestion = (): string => {
    // Remove previous question message from messages list
    messages.pop();
    // Remove previous answer message from messages list
    const previousAnswerMessage = messages.pop();
    const previousAnswerString = previousAnswerMessage?.content ?? "";
    // Update messages list in useChat hook
    setMessages(messages);
    // Calling this for only rerendering the current question,
    // because setMessages(messages) will not rerender the current question
    setInput(previousAnswerString);
    return previousAnswerString;
  };

  useEffect(() => {
    const isConversationFinished = data?.includes("conversationFinished");
    if (isConversationFinished) {
      const endScreenMessage =
        showCustomEndScreenMessage && customEndScreenMessage
          ? customEndScreenMessage
          : currentQuestion;

      setState((cs) => ({
        ...cs,
        endScreenMessage,
        formStage: "endScreen",
      }));
    }
  }, [data]);

  useEffect(() => {
    setState((cs) => ({ ...cs, formStage: "endScreen" }));
    setMessages([]);
  }, [form, refresh]);

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
          showPrevQuestionButton={showPrevQuestionButton}
          submitAnswer={submitAnswer}
        />
      )}
      {currentStage === "endScreen" && (
        <EndScreen endScreenMessage={endScreenMessage} />
      )}
    </div>
  );
}
