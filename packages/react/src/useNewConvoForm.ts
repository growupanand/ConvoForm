"use client";

import { useCallback, useEffect, useState } from "react";

import { Message } from "./types/message";
import { parseStreamLine, readResponseStream } from "./utils/streamUtils";

type Props = {
  formId: string;
  onError?: (error: Error) => void;
};

type State = {
  conversationId?: string;
  currentQuestion: string;
  data?: Record<string, any>;
  fieldsData: Record<string, any>[];
  currentField?: string;
  isBusy: boolean;
  messages: Message[];
};

export function useNewConvoForm({ formId, onError }: Readonly<Props>) {
  const apiEndpoint = `/api/form/${formId}/new-conversation`;

  const [state, setState] = useState<State>({
    conversationId: undefined,
    currentQuestion: "",
    data: undefined,
    fieldsData: [],
    currentField: undefined,
    isBusy: false,
    messages: [],
  });
  const { currentQuestion, data, isBusy, messages } = state;

  const {
    id: conversationId,
    fieldsData,
    currentField,
    isFormSubmissionFinished,
  } = data ?? {};

  const endScreenMessage = isFormSubmissionFinished ? currentQuestion : "";

  console.log({
    conversationId,
    currentQuestion,
    data,
    fieldsData,
    currentField,
    messages,
  });

  async function submitAnswer(answer: string) {
    setState((cs) => ({ ...cs, isBusy: true, currentQuestion: "" }));

    const answerMessage: Message = {
      role: "user",
      content: answer,
    };

    // This is first api call to fetch form fields, conversationId and currentQuestion
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        messages: [...messages, answerMessage],
        currentField,
      }),
    });

    if (!response.ok || !response.body) {
      onError?.(new Error("Failed to fetch question"));
      return;
    }

    let currentQuestionText = "";
    let updatedCurrentField;

    const reader = response.body.getReader();
    for await (const { textValue, data } of readResponseStream(reader)) {
      if (textValue) {
        currentQuestionText += textValue;
      }

      updatedCurrentField = data?.currentField;

      setState((cs) => ({
        ...cs,
        currentQuestion: currentQuestionText,
        data,
      }));
    }

    const questionMessage: Message = {
      role: "assistant",
      content: currentQuestionText,
      fieldName: updatedCurrentField,
    };

    setState((cs) => ({
      ...cs,
      isBusy: false,
      messages: cs.messages.concat([answerMessage, questionMessage]),
    }));
  }

  return {
    submitAnswer,
    currentQuestion,
    conversationId,
    fieldsData,
    currentField,
    isBusy,
    isFormSubmissionFinished,
    endScreenMessage,
  };
}
