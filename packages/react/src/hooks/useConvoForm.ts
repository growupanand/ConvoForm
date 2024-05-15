"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "@convoform/websocket-client";

import { API_DOMAIN } from "../constants";
import { ExtraStreamData, Message } from "../types";
import { readResponseStream } from "../utils/streamUtils";

type Props = {
  formId: string;
  onError?: (error: Error) => void;
};

type State = {
  currentQuestion: string;
  data?: ExtraStreamData;
  isBusy: boolean;
  messages: Message[];
};

const initialState: State = {
  currentQuestion: "",
  data: undefined,
  isBusy: false,
  messages: [],
};

export function useConvoForm({ formId, onError }: Readonly<Props>) {
  const apiEndpoint = `${API_DOMAIN}/api/form/${formId}/conversation`;

  const [state, setState] = useState<State>(initialState);
  const { currentQuestion, data, isBusy, messages } = state;

  const {
    id: conversationId,
    fieldsData,
    currentField,
    isFormSubmissionFinished,
  } = data ?? {};

  const endScreenMessage = isFormSubmissionFinished ? currentQuestion : "";

  const resetForm = useCallback(() => {
    if (conversationId !== undefined) {
      socket.emit("conversation:stopped", { conversationId, formId });
    }
    setState(initialState);
  }, [conversationId]);

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

  useEffect(() => {
    // If new conversation started
    if (conversationId !== undefined) {
      socket.emit("conversation:started", { conversationId, formId });
    }
  }, [conversationId]);

  useEffect(() => {
    // If conversation is already started, then update the conversation
    if (conversationId !== undefined && isBusy === false) {
      setTimeout(() => {
        socket.emit("conversation:updated", { conversationId });
      }, 2000);
    }
  }, [isBusy]);

  useEffect(() => {
    if (conversationId !== undefined && isFormSubmissionFinished === true) {
      socket.emit("conversation:stopped", { conversationId, formId });
    }
  }, [isFormSubmissionFinished]);

  return {
    submitAnswer,
    currentQuestion,
    conversationId,
    fieldsData,
    currentField,
    isBusy,
    isFormSubmissionFinished,
    endScreenMessage,
    resetForm,
  };
}
