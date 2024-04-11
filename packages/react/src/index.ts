"use client";

import { useCallback, useEffect, useState } from "react";
import { useChat } from "ai/react";

import { getCurrentQuestion, isFirstQuestion } from "./utils";

type Props = {
  isPreview?: boolean;
  formId: string;
  onError?: (error: Error) => void;
  showCustomEndScreenMessage?: boolean;
  customEndScreenMessage?: string;
};

type State = {
  endScreenMessage: string;
  isFormFinished: boolean;
};

export function useConvoForm({
  isPreview,
  formId,
  onError,
  showCustomEndScreenMessage,
  customEndScreenMessage,
}: Readonly<Props>) {
  const apiEndpoint = `/api/form/${formId}/conversation`;

  const [state, setState] = useState<State>({
    endScreenMessage: "",
    isFormFinished: false,
  });
  const { endScreenMessage, isFormFinished } = state;

  const { messages, append, data, setMessages, isLoading, setInput } = useChat({
    api: apiEndpoint,
    body: { isPreview },
    onError: onError,
  });

  const currentQuestion = getCurrentQuestion(messages) ?? "";
  const isCurrentQuestionFirstQuestion = isFirstQuestion(messages);

  const submitAnswer = useCallback(async (answer: string) => {
    await append({
      content: answer,
      role: "user",
    });
  }, []);

  const handleGoToPrevQuestion = (): string => {
    // Remove previous question message from messages list
    messages.pop();
    // Remove previous answer message from messages list
    const previousAnswerMessage = messages.pop();
    const previousAnswerString = previousAnswerMessage?.content ?? "";
    // Update messages list in useChat hook
    setMessages(messages);
    // Calling this for only rerendering the current question,
    // because setMessages(messages) will not rerender the current question
    setInput(previousAnswerString);
    return previousAnswerString;
  };

  const resetForm = useCallback(() => {
    setMessages([]);
    setInput("");
  }, []);

  useEffect(() => {
    const isConversationFinished = data?.includes("conversationFinished");
    if (isConversationFinished) {
      const endScreenMessage =
        showCustomEndScreenMessage && customEndScreenMessage
          ? customEndScreenMessage
          : currentQuestion;

      setState((cs) => ({
        ...cs,
        endScreenMessage,
        isFormFinished: true,
      }));
    }
  }, [data]);

  return {
    messages,
    append,
    data,
    setMessages,
    isLoading,
    setInput,
    currentQuestion,
    isFirstQuestion: isCurrentQuestionFirstQuestion,
    submitAnswer,
    /**
     * This will remove the current question and previous answer from the messages list of useChat hook
     * And return the previous answer string
     * @returns
     */
    handleGoToPrevQuestion,
    endScreenMessage,
    resetForm,
    isFormFinished,
  };
}
