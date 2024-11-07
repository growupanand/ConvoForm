"use client";

import type {
  Conversation,
  ExtraStreamData,
  Transcript,
} from "@convoform/db/src/schema";
import { socket } from "@convoform/websocket-client";
import { useCallback, useEffect, useState } from "react";

import { API_DOMAIN, CONVERSATION_START_MESSAGE } from "../constants";
import {
  createConversation,
  patchConversation,
} from "../controllers/conversationControllers";
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
  isReady: boolean;
  errorMessage: string | undefined;
  conversation: Conversation | undefined;
};

const initialState: State = {
  currentQuestion: "",
  extraStreamData: {},
  isBusy: false,
  transcript: [],
  isConversationStarted: false,
  isReady: false,
  errorMessage: undefined,
  conversation: undefined,
};

export function useConvoForm({
  /** Generated from id from ConvoForm.com */
  formId,
  /** Callback function will be called if something went wrong */
  onError,
}: Readonly<Props>) {
  const apiEndpoint = `${API_DOMAIN}/api/form/${formId}/conversation`;

  const [state, setState] = useState<State>(initialState);
  const resetStates = useCallback(() => setState(initialState), []);

  const {
    currentQuestion,
    extraStreamData,
    isBusy,
    transcript,
    isConversationStarted,
    conversation,
  } = state;
  const { collectedData, currentField, isFormSubmissionFinished } =
    extraStreamData;

  const resetForm = useCallback(() => {
    if (conversation !== undefined) {
      socket.emit("conversation:stopped", {
        conversationId: conversation.id,
        formId,
      });
    }
    resetStates();
  }, [conversation]);

  const submitAnswer: SubmitAnswer = async (
    answer,
    newConversation?: Conversation,
  ) => {
    const initialMessage = newConversation !== undefined;
    const currentConversation = initialMessage ? newConversation : conversation;

    if (!currentConversation) {
      return setState((cs) => ({
        ...cs,
        errorMessage: "Conversation not found",
      }));
    }

    setState((cs) => ({
      ...cs,
      isBusy: true,
      currentQuestion: "",
      isConversationStarted: true,
      conversation: currentConversation,
    }));

    const answerMessage: Transcript = {
      role: "user",
      content: answer,
    };

    const requestPayload = {
      ...currentConversation,
      transcript: initialMessage
        ? [answerMessage]
        : [...transcript, answerMessage],
      currentField: initialMessage ? undefined : currentField,
      collectedData: initialMessage
        ? currentConversation.collectedData
        : collectedData,
    };

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
    let updatedExtraSteamData: ExtraStreamData | undefined;
    for await (const {
      textValue,
      data: streamData,
    } of readResponseStream<ExtraStreamData>(reader)) {
      if (textValue) {
        currentQuestionText += textValue;
      }

      updatedCurrentField = streamData?.currentField?.fieldName;

      updatedExtraSteamData = { ...extraStreamData, ...streamData };
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

    const updatedTranscript = transcript.concat([
      answerMessage,
      questionMessage,
    ]);

    await patchConversation(formId, currentConversation.id, {
      collectedData: updatedExtraSteamData?.collectedData,
      transcript: updatedTranscript,
      isFinished: !!updatedExtraSteamData?.isFormSubmissionFinished,
      name: updatedExtraSteamData?.conversationName,
    });

    setState((cs) => ({
      ...cs,
      isBusy: false,
      transcript: updatedTranscript,
    }));
  };

  const startConversation = useCallback(async () => {
    const newConversation = await createConversation(formId);
    submitAnswer(CONVERSATION_START_MESSAGE, newConversation);
  }, [formId]);

  useEffect(() => {
    // If new conversation started
    if (conversation !== undefined) {
      socket.emit("conversation:started", {
        conversationId: conversation.id,
        formId,
      });
    }
  }, [conversation]);

  useEffect(() => {
    // If conversation is already started, then update the conversation
    if (conversation !== undefined && isBusy === false) {
      setTimeout(() => {
        socket.emit("conversation:updated", {
          conversationId: conversation.id,
        });
      }, 2000);
    }
  }, [isBusy]);

  useEffect(() => {
    if (conversation !== undefined && isFormSubmissionFinished === true) {
      socket.emit("conversation:stopped", {
        conversationId: conversation.id,
        formId,
      });
    }
  }, [isFormSubmissionFinished]);

  return {
    /** Function to submit an answer to the current question */
    submitAnswer,

    /** The text of the current question in the conversation, will update as soon as the question is being fetched */
    currentQuestion,

    /** The ID of the current conversation */
    conversationId: conversation?.id,

    /** Data related to form fields */
    collectedData,

    /** The current field in focus */
    currentField,

    /** Boolean indicating whether any API call is ongoing */
    isBusy,

    /** Boolean indicating whether the form submission is finished */
    isFormSubmissionFinished,

    /** Function to reset the form state */
    resetForm,

    /** Boolean indicating whether the conversation is started */
    isConversationStarted,

    /** Function to start the conversation */
    startConversation,
  };
}

export type UseConvoFormReturnType = ReturnType<typeof useConvoForm>;
