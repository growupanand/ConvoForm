"use client";

import { useCallback, useEffect, useState } from "react";
import { showErrorResponseToast } from "@convoform/ui/components/ui/use-toast";
import { useChat } from "ai/react";

import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { api } from "@/trpc/react";
import { getCurrentQuestion, isFirstQuestion } from "./utils";

type Props = {
  isPreview?: boolean;
  formId: string;
};

type State = {
  endScreenMessage: string;
};

export function useConvoForm({ isPreview, formId }: Readonly<Props>) {
  const { isFetching, data: form } = api.form.getOne.useQuery(
    {
      id: formId,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const isReady = !isFetching;

  const { showCustomEndScreenMessage, customEndScreenMessage } = form ?? {};
  const apiEndpoint = `/api/form/${formId}/conversation`;

  const [state, setState] = useState<State>({
    endScreenMessage: "",
  });
  const { endScreenMessage } = state;

  const { messages, append, data, setMessages, isLoading, setInput } = useChat({
    api: apiEndpoint,
    body: { isPreview },
    onError(error) {
      let errorMessage;
      try {
        if (isRateLimitErrorResponse(error)) {
          errorMessage = error.message ?? "Rate limit exceeded";
        } else {
          errorMessage = JSON.parse(error.message).nonFieldError;
        }
      } catch (_) {
        errorMessage = undefined;
      }
      showErrorResponseToast(error, errorMessage);
    },
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
        formStage: "endScreen",
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
    isReady,
  };
}
