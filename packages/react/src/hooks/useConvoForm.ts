"use client";

import type {
  Conversation,
  ExtraStreamData,
  Transcript,
} from "@convoform/db/src/schema";
import { sendMessage } from "@convoform/websocket-client";
import { useCallback, useEffect, useState } from "react";
// Manual parsing of AI SDK UI message stream format

import { API_DOMAIN } from "../constants";
import {
  createConversation,
  patchConversation,
} from "../controllers/conversationControllers";
import type { SubmitAnswer } from "../types";

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

  const setError = useCallback(
    (errorMessage: string) => {
      setState((cs) => ({
        ...cs,
        errorMessage: errorMessage,
      }));
      onError?.(new Error(errorMessage));
    },
    [onError],
  );

  const parseStreamResponse = async (
    response: Response,
    answerMessage?: Transcript,
  ) => {
    let generatedQuestion = "";
    let updatedCurrentField: string | undefined;
    let updatedExtraSteamData: ExtraStreamData | undefined;
    let updatedConversation: Conversation | undefined;

    // Parse AI SDK UI message stream format (Server-Sent Events)
    // This matches the SSE wire protocol used by createUIMessageStreamResponse
    if (!response.body) {
      throw new Error("No response body available");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse Server-Sent Events format: "data: {json}"
          if (line.startsWith("data: ")) {
            const dataContent = line.slice(6); // Remove "data: " prefix

            // Handle stream termination
            if (dataContent === "[DONE]") {
              break;
            }

            try {
              const eventData = JSON.parse(dataContent);

              // Handle different event types from AI SDK UI message stream
              switch (eventData.type) {
                case "text-delta":
                  // Accumulate text deltas to build the complete question
                  generatedQuestion += eventData.delta || "";
                  setState((cs) => ({
                    ...cs,
                    currentQuestion: generatedQuestion,
                  }));
                  break;

                case "data-conversation":
                  // Handle conversation update data chunks from the backend
                  try {
                    const streamData = eventData.data;
                    updatedCurrentField =
                      streamData.currentField?.fieldName ?? undefined;
                    updatedExtraSteamData = {
                      ...extraStreamData,
                      currentField: streamData.currentField,
                      collectedData: streamData.collectedData,
                      isFormSubmissionFinished:
                        streamData.isFormSubmissionFinished,
                    };
                    updatedConversation = streamData.conversation;

                    setState((cs) => ({
                      ...cs,
                      extraStreamData: updatedExtraSteamData ?? {},
                      conversation: updatedConversation || cs.conversation,
                    }));
                  } catch (error) {
                    console.warn(
                      "Failed to process conversation data chunk:",
                      error,
                    );
                  }
                  break;

                case "start":
                case "text-start":
                case "text-end":
                case "finish-step":
                case "finish":
                  // These are control events, we can log them for debugging
                  // but don't need to handle them for our use case
                  break;

                default:
                  // Log unknown event types for debugging
                  console.debug("Unknown stream event type:", eventData.type);
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", e, "Line:", line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const questionMessage: Transcript = {
      role: "assistant",
      content: generatedQuestion,
      ...(updatedCurrentField && { fieldName: updatedCurrentField }),
    };

    // For initial requests, don't include answer message in transcript
    const updatedTranscript = answerMessage
      ? transcript.concat([answerMessage, questionMessage])
      : [questionMessage];

    return {
      generatedQuestion,
      updatedTranscript,
      updatedCurrentField,
      updatedExtraSteamData: updatedExtraSteamData ?? {},
      updatedConversation,
    };
  };

  const fetchInitialQuestion = async (conversation: Conversation) => {
    const requestPayload = {
      ...conversation,
      transcript: [], // Empty transcript for initial request
      isInitialRequest: true, // Flag to indicate this is the first request
      collectedData: conversation.collectedData,
    };

    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to fetch initial question");
    }

    return await parseStreamResponse(response); // No answer message for initial request
  };

  const fetchNextQuestion = async (
    answer: string,
    conversation: Conversation,
    isNewConversation: boolean,
  ) => {
    const answerMessage: Transcript = {
      role: "user",
      content: answer,
    };
    const requestPayload = {
      ...conversation,
      transcript: isNewConversation
        ? [answerMessage]
        : [...transcript, answerMessage],
      currentField: isNewConversation ? undefined : currentField,
      collectedData: isNewConversation
        ? conversation.collectedData
        : collectedData,
      isInitialRequest: false, // Explicitly set to false for answer processing
    };

    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to fetch question");
    }

    return await parseStreamResponse(response, answerMessage);
  };

  /**
   * Submit the answer to the current question and get the next question.
   * If newConversation is provided, it will be used to generate the next question.
   * Otherwise, the existing conversation will be used.
   * @param answer The answer to the current question.
   * @param newConversation Optional. The new conversation to use.
   * @returns nothing
   */
  const submitAnswer: SubmitAnswer = async (
    answer,
    newConversation?: Conversation,
  ) => {
    const isNewConversation = newConversation !== undefined;
    const currentConversation = isNewConversation
      ? newConversation
      : conversation;

    if (!currentConversation) {
      return setError("Conversation not found");
    }

    setState((cs) => ({
      ...cs,
      isBusy: true,
      currentQuestion: "",
      isConversationStarted: true,
      conversation: currentConversation,
    }));

    const { updatedExtraSteamData, updatedTranscript, updatedConversation } =
      await fetchNextQuestion(answer, currentConversation, isNewConversation);

    // Use the updated conversation from the stream if available
    const conversationToUpdate = updatedConversation || currentConversation;

    await patchConversation(formId, conversationToUpdate.id, {
      collectedData:
        updatedExtraSteamData?.collectedData ||
        conversationToUpdate.collectedData,
      transcript: updatedTranscript,
      finishedAt: updatedExtraSteamData?.isFormSubmissionFinished
        ? new Date()
        : null,
      name:
        updatedExtraSteamData?.conversationName || conversationToUpdate.name,
    });

    setState((cs) => ({
      ...cs,
      isBusy: false,
      transcript: updatedTranscript,
      conversation: conversationToUpdate,
    }));
  };

  /**
   * Start a new conversation
   */
  const startConversation = useCallback(async () => {
    try {
      const newConversation = await createConversation(formId);

      setState((cs) => ({
        ...cs,
        isBusy: true,
        currentQuestion: "",
        isConversationStarted: true,
        conversation: newConversation,
      }));

      // Fetch the initial question for the first field
      const { updatedExtraSteamData, updatedTranscript, updatedConversation } =
        await fetchInitialQuestion(newConversation);

      // Use the updated conversation from the stream if available
      const conversationToUpdate = updatedConversation || newConversation;

      await patchConversation(formId, conversationToUpdate.id, {
        collectedData:
          updatedExtraSteamData?.collectedData ||
          conversationToUpdate.collectedData,
        transcript: updatedTranscript,
        finishedAt: updatedExtraSteamData?.isFormSubmissionFinished
          ? new Date()
          : null,
        name:
          updatedExtraSteamData?.conversationName || conversationToUpdate.name,
      });

      setState((cs) => ({
        ...cs,
        isBusy: false,
        transcript: updatedTranscript,
        conversation: conversationToUpdate,
      }));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to start conversation",
      );
      setState((cs) => ({ ...cs, isBusy: false }));
    }
  }, [formId, fetchInitialQuestion, patchConversation, setError]);

  useEffect(() => {
    // When a new form submission is started
    if (conversation !== undefined) {
      // Notify the form creator that a new conversation has started
      sendMessage("conversation:started", {
        conversationId: conversation.id,
        formId,
      });
    }
  }, [conversation]);

  useEffect(() => {
    // If conversation is already in-progress, and user has answered an question
    if (conversation !== undefined && isBusy === false) {
      sendMessage("conversation:updated", {
        conversationId: conversation.id,
        formId,
      });
    }
  }, [isBusy]);

  useEffect(() => {
    if (conversation !== undefined && isFormSubmissionFinished === true) {
      sendMessage("conversation:stopped", {
        conversationId: conversation.id,
        formId,
      });
    }
  }, [isFormSubmissionFinished]);

  const resetForm = useCallback(() => {
    if (conversation !== undefined) {
      sendMessage("conversation:stopped", {
        conversationId: conversation.id,
        formId,
      });
    }
    resetStates();
  }, [conversation]);

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
