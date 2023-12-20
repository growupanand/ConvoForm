"use client";

import { Form } from "@prisma/client";
import { WelcomeScreen } from "./welcomeScreen";
import { useEffect, useState } from "react";
import { FormFieldsViewer } from "./formFields";
import { useChat } from "ai/react";
import { EndScreen } from "./endScreen";
import { CONVERSATION_START_MESSAGE } from "@/lib/constants";

type Props = {
  form: Form;
  refresh?: boolean;
  isPreview?: boolean;
};

type State = {
  formStage: FormStage;
  isFormBusy: boolean;
  endScreenMessage: string;
};

export type FormStage = "welcomeScreen" | "conversationFlow" | "endScreen";

export function FormViewer({ form, refresh, isPreview }: Props) {
  const apiEndpoint = `/api/form/${form.id}/conversation`;

  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
    isFormBusy: false,
    endScreenMessage: "",
  });

  const { formStage: currentStage, isFormBusy, endScreenMessage } = state;

  const { messages, input, handleInputChange, handleSubmit, append, data } =
    useChat({
      api: apiEndpoint,
      onFinish: () => setState((s) => ({ ...s, isFormBusy: false })),
      body: { isPreview },
    });

  const getCurrentQuestion = () => {
    const assistantMessage = messages.findLast((m) => m.role === "assistant");
    if (!assistantMessage) {
      return "";
    }
    return assistantMessage.content;
  };

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    if (!isFormBusy) {
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
    if (isPreview) {
      setState((cs) => ({ ...cs, formStage: "welcomeScreen" }));
    }
  }, [refresh]);

  return (
    <div className="max-w-[700px] mx-auto container ">
      {currentStage === "welcomeScreen" && (
        <WelcomeScreen form={form} onCTAClick={handleCTAClick} />
      )}

      {currentStage === "conversationFlow" && (
        <FormFieldsViewer
          currentQuestion={getCurrentQuestion()}
          handleFormSubmit={handleFormSubmit}
          handleInputChange={handleInputChange}
          input={input}
          isFormBusy={isFormBusy}
        />
      )}
      {currentStage === "endScreen" && (
        <EndScreen endScreenMessage={endScreenMessage} />
      )}
    </div>
  );
}
