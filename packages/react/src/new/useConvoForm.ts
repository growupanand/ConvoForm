"use client";

import { useChat } from "@ai-sdk/react";
import type { Conversation } from "@convoform/db/src/schema";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CoreServiceUIMessage } from "../../../ai";
import { API_DOMAIN } from "../constants";
import type { UseConvoFormProps, UseConvoFormReturnType } from "./types";

export function useConvoForm(props: UseConvoFormProps): UseConvoFormReturnType {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const { setMessages, sendMessage, messages, status, error, clearError } =
    useChat<CoreServiceUIMessage>({
      transport: new DefaultChatTransport({
        api: props.apiEndpoint ?? `${API_DOMAIN}/api/conversation`,
      }),
      onData: async (dataPart) => {
        if (dataPart.type === "data-conversation") {
          setConversation(dataPart.data as Conversation);
        }
      },
      onError: (error) => {
        props.onError?.(error);
      },
    });

  // Handle onFinish when conversation is completed
  useEffect(() => {
    if (conversation?.finishedAt && props.onFinish) {
      props.onFinish(conversation);
    }
  }, [conversation?.finishedAt, conversation?.id]);

  const isConversationInitialized = !!conversation;
  const currentFieldId = conversation?.currentFieldId ?? null;

  const progress = useMemo(() => {
    if (!isConversationInitialized) {
      return 0;
    }
    return (
      conversation.formFieldResponses.filter((field) => field.fieldValue)
        .length / conversation.formFieldResponses.length
    );
  }, [isConversationInitialized, conversation?.formFieldResponses]);

  const conversationState = useMemo(() => {
    if (!isConversationInitialized) {
      if (status === "submitted" || status === "streaming") {
        return "initializing";
      }

      return "idle";
    }
    if (conversation.finishedAt) {
      return "completed";
    }
    return "inProgress";
  }, [isConversationInitialized, conversation?.finishedAt, status]);

  const currentQuestionText = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      return null;
    }
    return lastMessage.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");
  }, [messages]);

  const transportBody = useMemo(() => {
    return {
      formId: props.formId,
      type: isConversationInitialized ? "existing" : "new",
      conversationId: conversation?.id,
      currentFieldId: conversation?.currentFieldId,
    };
  }, [conversation?.id, props.formId, conversation?.currentFieldId]);

  const submitAnswer = useCallback(
    async (answerText: string) => {
      setMessages([]);
      return await sendMessage(undefined, {
        body: {
          ...transportBody,
          answerText,
        },
      });
    },
    [transportBody, sendMessage],
  );

  const initializeConversation = async () => {
    if (isConversationInitialized) {
      throw new Error("Conversation already initialized");
    }
    await submitAnswer("answer text in body");
  };

  const resetConversation = useCallback(async () => {
    setConversation(null);
    setMessages([]);
    clearError();
  }, [setMessages, clearError]);

  return {
    // Methods
    initializeConversation,
    resetConversation,
    submitAnswer,
    // States
    conversation,
    messages,
    chatStatus: status,
    error,
    currentFieldId,
    currentQuestionText,
    conversationState,
    progress,
  };
}
