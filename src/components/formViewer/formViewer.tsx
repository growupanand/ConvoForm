"use client";

import { Form } from "@prisma/client";
import { WelcomeScreen } from "./welcomeScreen";
import { useState } from "react";
import { FormFieldsViewer } from "./formFields";
import { useChat } from "ai/react";

type Props = {
  form: Form;
};

type State = {
  formStage: FormStage;
  isFormBusy: boolean;
};

export type FormStage = "welcomeScreen" | "formFields" | "endScreen";

export function FormViewer({ form }: Props) {
  const apiEndpoint = `/api/form/${form.id}/conversation`;

  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
    isFormBusy: false,
  });
  const { formStage: currentStage, isFormBusy } = state;

  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    api: apiEndpoint,
    onResponse: () => setState((s) => ({ ...s, isFormBusy: false })),
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
    gotoStage("formFields");
    append({
      content: "hello, i want to fill the form",
      role: "user",
      id: "1",
    });
  };

  if (currentStage === "welcomeScreen")
    return <WelcomeScreen form={form} onCTAClick={handleCTAClick} />;

  if (currentStage === "formFields")
    return (
      <FormFieldsViewer
        currentQuestion={getCurrentQuestion()}
        handleFormSubmit={handleFormSubmit}
        handleInputChange={handleInputChange}
        input={input}
        isFormBusy={isFormBusy}
      />
    );
}
