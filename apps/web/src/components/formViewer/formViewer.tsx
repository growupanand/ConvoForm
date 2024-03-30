"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Form } from "@convoform/db";
import { sendErrorResponseToast } from "@convoform/ui/components/ui/use-toast";
import { useChat } from "ai/react";

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
  endScreenMessage: string;
};

export type FormStage = "welcomeScreen" | "conversationFlow" | "endScreen";

export function FormViewer({ form, refresh, isPreview }: Props) {
  const apiEndpoint = `/api/form/${form.id}/conversation`;

  const { showCustomEndScreenMessage, customEndScreenMessage } = form;

  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
    endScreenMessage: "",
  });

  const { formStage: currentStage, endScreenMessage } = state;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    data,
    setMessages,
    isLoading,
  } = useChat({
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
      sendErrorResponseToast(error, errorMessage);
    },
  });

  const isFirstQuestion =
    messages.filter((message) => message.role === "assistant").length <= 1;

  const getCurrentQuestion = () => {
    const lastMessage = messages[messages.length - 1];
    const currentQuestion =
      lastMessage?.role === "assistant" && lastMessage.content;
    if (currentQuestion && currentQuestion !== "") {
      return currentQuestion;
    }
    return "";
  };

  const currentQuestion = getCurrentQuestion();

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    if (!isLoading) {
      setState((s) => ({ ...s, isFormBusy: true }));
      handleSubmit(event);
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

  const handleShowPreviousQuestion = () => {
    // Remove previous question message from messages list
    messages.pop();
    // Remove previous answer message from messages list
    const previousAnswerMessage = messages.pop();
    setMessages(messages);
    // Set previous answer in text input
    const event = {
      target: {
        value: previousAnswerMessage?.content || "",
      },
    } as ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(event);
  };

  useEffect(() => {
    if (data?.includes("conversationFinished")) {
      const currentEndScreenMessage =
        showCustomEndScreenMessage && customEndScreenMessage
          ? customEndScreenMessage
          : currentQuestion;

      setState((cs) => ({
        ...cs,
        endScreenMessage: currentEndScreenMessage,
        formStage: "endScreen",
      }));
    }
  }, [data]);

  useEffect(() => {
    setState((cs) => ({ ...cs, formStage: "welcomeScreen" }));
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
          handleFormSubmit={handleFormSubmit}
          handleInputChange={handleInputChange}
          input={input}
          isFormBusy={isLoading}
          handleShowPreviousQuestion={handleShowPreviousQuestion}
          isFirstQuestion={isFirstQuestion}
        />
      )}
      {currentStage === "endScreen" && (
        <EndScreen endScreenMessage={endScreenMessage} />
      )}
    </div>
  );
}
