"use client";

import { useConvoForm } from "@convoform/react";
import { Button, Card, Input } from "@convoform/ui";
import { useState } from "react";

export function Test() {
  const [answerText, setAnswerText] = useState("");
  const {
    initializeConversation,
    conversation,
    messages,
    chatStatus,
    error,
    submitAnswer,
    resetConversation,
    currentQuestionText,
    conversationState,
  } = useConvoForm({
    formId: "demo",
    onFinish: (conversation) => {
      console.log("Conversation completed", conversation);
    },
  });

  const isConversationInitialized = !!conversation;

  const handleProcessConversation = async (answerText?: string) => {
    if (!isConversationInitialized) {
      await initializeConversation();
      return;
    }
    if (!answerText) {
      throw new Error("Answer text is required");
    }
    await submitAnswer(answerText);
  };

  return (
    <div className="container mx-auto p-10 space-y-10">
      <div>
        <h1>Playground - New Convo Form</h1>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <Input
            placeholder="Answer"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={!isConversationInitialized}
          />
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => handleProcessConversation(answerText)}
              // disabled={status !== "ready"}
            >
              {isConversationInitialized
                ? "Send Answer"
                : "Initialize Conversation"}
            </Button>
            <Button variant="outline" onClick={() => resetConversation()}>
              Reset Conversation
            </Button>
          </div>
        </div>
        <Card className="p-10 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <pre>
            {JSON.stringify(
              {
                chatStatus,
                conversationState,
                error,
                currentQuestionText,
                conversation,
              },
              null,
              2,
            )}
          </pre>
        </Card>
        <Card className="p-10 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <div>
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.parts
                    .filter((part) => part.type === "text")
                    .map((part, index) => (
                      <div key={`${message.id}-${index}`}>{part.text}</div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
