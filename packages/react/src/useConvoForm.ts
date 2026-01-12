"use client";

import { useChat } from "@ai-sdk/react";
import {
  type EdgeSpanHandle,
  type EdgeTracer,
  createBrowserTracer,
} from "@convoform/tracing";
import { sendMessage as sendWebsocketMessage } from "@convoform/websocket-client";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CoreServiceUIMessage } from "../../ai";
import type { CoreConversation } from "../../db/src/schema";
import { API_DOMAIN } from "./constants";
import type { UseConvoFormProps, UseConvoFormReturnType } from "./types";

// ============================================================
// useConvoForm Hook
// ============================================================

export function useConvoForm(props: UseConvoFormProps): UseConvoFormReturnType {
  const [conversation, setConversation] = useState<CoreConversation | null>(
    null,
  );

  // Initialize tracer
  // We use a ref to keep the tracer instance stable
  const tracerRef = useRef<EdgeTracer | null>(null);

  useEffect(() => {
    if (!tracerRef.current) {
      // Use provided tracer or fall back to browser tracer (for local development)
      tracerRef.current =
        props.tracer ?? createBrowserTracer("convoform-react-client");
    }
  }, [props.tracer]);

  // Track active spans
  const streamSpanRef = useRef<EdgeSpanHandle | null>(null);
  const loadingSpanRef = useRef<EdgeSpanHandle | null>(null);

  // TTFB tracking
  const requestStartTimeRef = useRef<number | null>(null);
  const firstByteReceivedRef = useRef<boolean>(false);

  const { setMessages, sendMessage, messages, status, error, clearError } =
    useChat<CoreServiceUIMessage>({
      transport: new DefaultChatTransport({
        api: `${props.apiDomain ?? API_DOMAIN}/api/conversation`,
      }),
      onData: async (dataPart) => {
        if (dataPart.type === "data-conversation") {
          const updatedConversation = dataPart.data as CoreConversation;
          setConversation(updatedConversation);

          // Update trace ID to match conversation ID for unifying traces
          if (tracerRef.current) {
            tracerRef.current.setTraceId(updatedConversation.id);
          }

          if (streamSpanRef.current) {
            streamSpanRef.current.addEvent("conversation_updated");
          }

          sendWebsocketMessage("conversation:updated", {
            conversationId: updatedConversation.id,
            formId: props.formId,
          });
        }
      },
      onFinish: () => {
        // End stream span when generation finishes
        if (streamSpanRef.current) {
          streamSpanRef.current.end();
          streamSpanRef.current = null;
        }

        // Flush traces
        if (tracerRef.current) {
          tracerRef.current.flush();
        }
      },
      onError: (error) => {
        props.onError?.(error);
        if (loadingSpanRef.current) {
          loadingSpanRef.current.setStatus(
            "error",
            error instanceof Error ? error.message : String(error),
          );
          loadingSpanRef.current.end();
          loadingSpanRef.current = null;
        }
        if (streamSpanRef.current) {
          streamSpanRef.current.setStatus(
            "error",
            error instanceof Error ? error.message : String(error),
          );
          streamSpanRef.current.end();
          streamSpanRef.current = null;
        }
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
  const currentFieldName = useMemo(() => {
    if (!isConversationInitialized) {
      return null;
    }
    return (
      conversation.formFieldResponses.find(
        (field) => field.id === currentFieldId,
      )?.fieldName ?? null
    );
  }, [
    isConversationInitialized,
    conversation?.currentFieldId,
    conversation?.formFieldResponses,
  ]);

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

  // Track TTFB / Streaming Start
  useEffect(() => {
    if (
      status === "streaming" &&
      !streamSpanRef.current &&
      requestStartTimeRef.current !== null
    ) {
      const ttfb = Date.now() - requestStartTimeRef.current;
      firstByteReceivedRef.current = true;

      // Start stream span
      if (tracerRef.current) {
        // End 'submit_answer' span (loading state) if it's still open
        if (loadingSpanRef.current) {
          loadingSpanRef.current.end();
          loadingSpanRef.current = null;
        }

        // Start stream span
        streamSpanRef.current = tracerRef.current.startSpan("stream_question", {
          ttfb_ms: ttfb,
          form_id: props.formId,
          field_name: currentFieldName ?? undefined,
        });
      }

      props.logger?.info("Client: Stream started (TTFB)", {
        ttfb,
        status,
        formId: props.formId,
        conversationId: conversation?.id,
        organizationId: conversation?.organizationId,
        fieldName: currentFieldName,
      });

      // Reset for next request
      requestStartTimeRef.current = null;
    }

    streamSpanRef.current?.setAttribute("field_name", currentFieldName ?? "");
  }, [
    status,
    props.logger,
    props.formId,
    conversation?.id,
    conversation?.organizationId,
    currentFieldName,
  ]);

  const transportBody = useMemo(() => {
    return {
      formId: props.formId,
      type: isConversationInitialized ? "existing" : "new",
      coreConversation: conversation,
    };
  }, [conversation, props.formId]);

  const submitAnswer = useCallback(
    async (answerText: string) => {
      // Track request start time for TTFB measurement
      requestStartTimeRef.current = Date.now();
      firstByteReceivedRef.current = false;

      // Start trace if not already started
      if (tracerRef.current) {
        // If we have a conversation ID, trace ID is already set.
        // If not, a new trace ID will be generated by startSpan if not set.
        // But we want to ensure we have a trace ID to send to server.
        if (!tracerRef.current.getTraceId()) {
          tracerRef.current.startTrace();
        }

        loadingSpanRef.current = tracerRef.current.startSpan("submit_answer", {
          answer_text: answerText,
          is_initialization: !isConversationInitialized,
          form_id: props.formId,
          field_name: currentFieldName || undefined,
        });
      }

      props.logger?.debug("Client: Request started", {
        answerLength: answerText.length,
        isInitialization: !isConversationInitialized,
        formId: props.formId,
        conversationId: conversation?.id,
        organizationId: conversation?.organizationId,
        fieldName: currentFieldName,
      });

      setMessages([]);

      // Get headers to propagate trace context
      const traceHeaders: Record<string, string> = {};
      if (tracerRef.current) {
        const traceparent = tracerRef.current.getTraceparent();
        if (traceparent) {
          traceHeaders.traceparent = traceparent;
        }
      }

      return await sendMessage(undefined, {
        body: {
          ...transportBody,
          answerText,
        },
        headers: traceHeaders,
      });
    },
    [
      transportBody,
      sendMessage,
      props.logger,
      isConversationInitialized,
      props.formId,
      conversation?.id,
      conversation?.organizationId,
      currentFieldName,
    ],
  );

  const initializeConversation = async () => {
    if (isConversationInitialized) {
      throw new Error("Conversation already initialized");
    }
    await submitAnswer("answer text in body");
  };

  const resetConversation = useCallback(async () => {
    if (conversation) {
      sendWebsocketMessage("conversation:stopped", {
        conversationId: conversation.id,
        formId: props.formId,
      });
    }
    setConversation(null);
    setMessages([]);
    clearError();
    // Clear tracer state on reset? Maybe keep it for continuity unless strict reset needed
  }, [setMessages, clearError, conversation, props.formId]);

  // =========================================================
  // ----------------- Websocket Events ----------------------
  // =========================================================

  useEffect(() => {
    if (!conversation?.id) return;

    const conversationData = {
      conversationId: conversation.id,
      formId: props.formId,
    };

    sendWebsocketMessage("conversation:started", conversationData);
  }, [conversation?.id, props.formId]);

  useEffect(() => {
    if (!conversation?.finishedAt) return;

    const conversationData = {
      conversationId: conversation.id,
      formId: props.formId,
    };

    sendWebsocketMessage("conversation:stopped", conversationData);
  }, [conversation?.finishedAt, conversation?.id, props.formId]);

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
