"use client";

import { Form } from "@prisma/client";
import { WelcomeScreen } from "./welcomeScreen";
import { useEffect, useState } from "react";
import { FormFieldsViewer } from "./formFields";
import { useChat } from "ai/react";
import { Message } from "ai";
import { EndScreen } from "./endScreen";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import {
  CONVERSATION_END_MESSAGE,
  CONVERSATION_START_MESSAGE,
} from "@/lib/constants";

type Props = {
  form: Form;
  refresh?: boolean;
  isPreview?: boolean;
};

type State = {
  formStage: FormStage;
  isFormBusy: boolean;
  isConversationFinished: boolean;
  endScreenMessage: string;
};

export type FormStage = "welcomeScreen" | "conversationFlow" | "endScreen";

export function FormViewer({ form, refresh, isPreview }: Props) {
  const apiEndpoint = `/api/form/${form.id}/conversation`;

  const [state, setState] = useState<State>({
    formStage: "welcomeScreen",
    isFormBusy: false,
    isConversationFinished: false,
    endScreenMessage: "",
  });

  const {
    formStage: currentStage,
    isFormBusy,
    isConversationFinished,
    endScreenMessage,
  } = state;

  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    api: apiEndpoint,
    onResponse: () => setState((s) => ({ ...s, isFormBusy: false })),
    onFinish: handleOnResponse,
    body: { isConversationFinished, isPreview },
  });

  function handleOnResponse(message: Message) {
    const match = message.content.match(/^(.*?)\s*\[([^\[\]]*)\]/);
    const isConversationFinished =
      match && match[2].toLowerCase() === CONVERSATION_END_MESSAGE;

    if (isConversationFinished) {
      setState((s) => ({
        ...s,
        isConversationFinished: true,
        endScreenMessage: match[1],
      }));
    }
  }

  const handleFormSubmitted = async () => {
    toast({
      title: "Saving form details...",
    });
    gotoStage("endScreen");

    try {
      await append({
        content: CONVERSATION_END_MESSAGE,
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
      content: CONVERSATION_START_MESSAGE,
      role: "user",
    });
    gotoStage("conversationFlow");
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
