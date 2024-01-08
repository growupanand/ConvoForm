"use client";

import { Form } from "@prisma/client";
import { WelcomeScreen } from "./welcomeScreen";
import { useEffect, useState } from "react";
import { FormFieldsViewer } from "./formFields";
import { useChat } from "ai/react";
import { EndScreen } from "./endScreen";
import { CONVERSATION_START_MESSAGE } from "@/lib/constants";
import { sendErrorResponseToast } from "../ui/use-toast";

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
        errorMessage = JSON.parse(error.message).nonFieldError;
      } catch (_) {
        errorMessage = undefined;
      }
      sendErrorResponseToast(error, errorMessage);
    },
  });

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

  useEffect(() => {
    if (data?.includes("conversationFinished")) {
      setState((cs) => ({
        ...cs,
        endScreenMessage: getCurrentQuestion(),
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
        />
      )}
      {currentStage === "endScreen" && (
        <EndScreen endScreenMessage={endScreenMessage} />
      )}
    </div>
  );
}
