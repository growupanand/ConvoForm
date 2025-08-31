"use client";

import {} from "@ai-sdk/provider-utils";
import { useChat } from "@ai-sdk/react";
import type { CoreServiceUIMessage } from "@convoform/ai";
import { newUseConvoForm } from "@convoform/react";
import { Button, Card } from "@convoform/ui";
import { DefaultChatTransport, type UIMessage } from "ai";

class PublicChatTransport<T extends UIMessage> extends DefaultChatTransport<T> {
  public processStream(stream: ReadableStream<Uint8Array>) {
    return this.processResponseStream(stream);
  }
}

export function Test() {
  const { initializeConversation, conversation } = newUseConvoForm({
    formId: "demo",
  });

  const { messages, status } = useChat<CoreServiceUIMessage>({
    onData: async (dataPart) => {
      console.log("dataPart", dataPart);
    },
    transport: new DefaultChatTransport({
      api: "/api/playground/conversation",
    }),
  });

  console.log("playground messages", { messages });

  const handleInitializeConversation = async () => {
    const conversation = await initializeConversation();
    console.log("conversation", conversation);
  };

  const callPlaygroundConversationApi = async () => {
    // await sendMessage({
    //   text: "Hello",
    // });
    const response = await fetch("/api/playground/conversation");
    if (!response.body) {
      throw new Error("Stream reader not found");
    }

    // Create transport instance
    const transport = new PublicChatTransport<CoreServiceUIMessage>();

    // Process the stream to get UIMessageChunks
    const uiMessageChunkStream = transport.processStream(response.body);

    // Read the chunks
    const reader = uiMessageChunkStream.getReader();
    const chunks = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        console.log("Chunk:", value);
      }
    } finally {
      reader.releaseLock();
    }
  };

  return (
    <div className="container mx-auto p-10 space-y-10">
      <div>
        <h1>Playground - New Convo Form</h1>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => handleInitializeConversation()}>
              Initialize Conversation
            </Button>
            <Button onClick={() => callPlaygroundConversationApi()}>
              call Playground conversation api
            </Button>
          </div>
        </div>
        <Card className="p-10 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <pre>{JSON.stringify(conversation, null, 2)}</pre>
        </Card>
        <Card className="p-10 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <div>
            <pre>{JSON.stringify({ status }, null, 2)}</pre>
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.parts
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("")}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
