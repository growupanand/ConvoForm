"use client";

import { Form, FormField } from "@prisma/client";
import { WelcomeScreen } from "./welcomeScreen";
import { useCallback, useEffect, useState } from "react";
import { FormFieldsViewer } from "./formFields";
import { useChat } from "ai/react";
import { Message } from "ai";
import { EndScreen } from "./endScreen";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";

type Props = {
  form: Form & { formField: FormField[] };
  refresh?: boolean;
  isPreview?: boolean;
};

type State = {
  formStage: FormStage;
  isFormBusy: boolean;
  isConversationFinished: boolean;
};

export type FormStage = "welcomeScreen" | "formFields" | "endScreen";

export function FormViewer({ form, refresh, isPreview }: Props) {
  const apiEndpoint = `/api/form/${form.id}/conversation`;

  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
    isFormBusy: false,
    isConversationFinished: false,
  });

  const { formStage: currentStage, isFormBusy, isConversationFinished } = state;

  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    api: apiEndpoint,
    onResponse: () => setState((s) => ({ ...s, isFormBusy: false })),
    onFinish: handleOnResponse,
    body: { isConversationFinished, isPreview },
  });

  const getFieldIndexFromName = (fieldName: string) => {
    const fieldNames = form.formField.map((j) => j.fieldName);
    return fieldNames.indexOf(fieldName);
  };

  const getFieldNameFromResponse = (message: string) => {
    // get field name from response string, E.g. "What is your name? [name]" => "name"
    const match = message.match(/\[([^[\]]*)\]/);
    return match ? match[1] : null;
  };

  function handleOnResponse(message: Message) {
    // change field index
    const fieldName = getFieldNameFromResponse(message.content);
    if (!fieldName) {
      return;
    }
    const fieldIndex = getFieldIndexFromName(fieldName);
    const isConversationFinished = fieldName.toLowerCase() === "finish";

    setState((s) => ({
      ...s,
      lastValidAnsweredFieldIndex: fieldIndex,
      isConversationFinished,
      currentFieldName: fieldName,
    }));
  }

  const handleFormSubmitted = async () => {
    toast({
      title: "Saving form details...",
    });
    gotoStage("endScreen");

    try {
      await append({
        content: "finish",
        role: "user",
      });
      toast({
        title: "Form details saved successfully.",
        duration: 1500,
      });
    } catch (e) {
      toast({
        title: "Unable to save form details.",
        duration: 1500,
        action: (
          <Button
            variant="secondary"
            onClick={(e: any) => {
              e.target.disabled = true;
              handleFormSubmitted();
            }}
          >
            Retry
          </Button>
        ),
      });
    }
  };

  useEffect(() => {
    if (isConversationFinished === true) {
      handleFormSubmitted();
    }
  }, [isConversationFinished]);

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
      content: "hello, i want to fill the form",
      role: "user",
      id: "1",
    });
    gotoStage("formFields");
  };

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

      {currentStage === "formFields" && (
        <FormFieldsViewer
          currentQuestion={getCurrentQuestion()}
          handleFormSubmit={handleFormSubmit}
          handleInputChange={handleInputChange}
          input={input}
          isFormBusy={isFormBusy}
        />
      )}
      {currentStage === "endScreen" && <EndScreen />}
    </div>
  );
}
