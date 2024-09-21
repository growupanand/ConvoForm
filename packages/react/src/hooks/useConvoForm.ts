"use client";

import type { ExtraStreamData, Transcript } from "@convoform/db/src/schema";
import { socket } from "@convoform/websocket-client";
import { useCallback, useEffect, useState } from "react";

import { API_DOMAIN } from "../constants";
import type { SubmitAnswer } from "../types";
import { readResponseStream } from "../utils/streamUtils";

type Props = {
  formId: string;
  onError?: (error: Error) => void;
};

type State = {
  currentQuestion: string;
  extraStreamData: ExtraStreamData;
  isBusy: boolean;
  transcript: Transcript[];
  isConversationStarted: boolean;
};

const initialState: State = {
  currentQuestion: "",
  extraStreamData: {},
  isBusy: false,
  transcript: [],
  isConversationStarted: false,
};

export function useConvoForm({
  /** Generated from id from ConvoForm.com */
  formId,
  /** Callback function will be called if something went wrong */
  onError,
}: Readonly<Props>) {
  const apiEndpoint = `${API_DOMAIN}/api/form/${formId}/conversation`;

  const [state, setState] = useState<State>(initialState);
  const {
    currentQuestion,
    extraStreamData,
    isBusy,
    transcript,
    isConversationStarted,
  } = state;
  const {
    id: conversationId,
    collectedData,
    currentField,
    isFormSubmissionFinished,
  } = extraStreamData;

  const endScreenMessage = isFormSubmissionFinished ? currentQuestion : "";

  const resetForm = useCallback(() => {
    if (conversationId !== undefined) {
      socket.emit("conversation:stopped", { conversationId, formId });
    }
    setState(initialState);
  }, [conversationId]);

  const submitAnswer: SubmitAnswer = async (answer, initialMessage = false) => {
    setState((cs) => ({
      ...cs,
      isBusy: true,
      currentQuestion: "",
      isConversationStarted: true,
    }));

    const answerMessage: Transcript = {
      role: "user",
      content: answer,
    };

    const requestPayload = {
      conversationId: initialMessage ? undefined : conversationId,
      transcript: initialMessage
        ? [answerMessage]
        : [...transcript, answerMessage],
      currentField: initialMessage ? undefined : currentField,
    };

    // This is first api call to fetch form fields, conversationId and currentQuestion
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok || !response.body) {
      onError?.(new Error("Failed to fetch question"));
      return;
    }

    let currentQuestionText = "";
    let updatedCurrentField: string | undefined;

    const reader = response.body.getReader();
    for await (const {
      textValue,
      data: updatedExtraSteamData,
    } of readResponseStream<ExtraStreamData>(reader)) {
      if (textValue) {
        currentQuestionText += textValue;
      }

      updatedCurrentField = updatedExtraSteamData?.currentField?.fieldName;

      setState((cs) => ({
        ...cs,
        currentQuestion: currentQuestionText,
        extraStreamData: updatedExtraSteamData ?? {},
      }));
    }

    const questionMessage: Transcript = {
      role: "assistant",
      content: currentQuestionText,
      fieldName: updatedCurrentField,
    };

    setState((cs) => ({
      ...cs,
      isBusy: false,
      transcript: cs.transcript.concat([answerMessage, questionMessage]),
    }));
  };

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
    /** Function to submit an answer to the current question */
    submitAnswer,

    /** The text of the current question in the conversation, will update as soon as the question is being fetched */
    currentQuestion,

    /** The ID of the current conversation */
    conversationId,

    /** Data related to form fields */
    collectedData,

    /** The current field in focus */
    currentField,

    /** Boolean indicating whether any API call is ongoing */
    isBusy,

    /** Boolean indicating whether the form submission is finished */
    isFormSubmissionFinished,

    /** Message to display at the end screen */
    endScreenMessage,

    /** Function to reset the form state */
    resetForm,

    /** Boolean indicating whether the conversation is started */
    isConversationStarted,
  };
}
