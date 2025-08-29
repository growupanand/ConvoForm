import { AI_MODEL } from "@convoform/ai";
import {
  type UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import type { NextRequest } from "next/server";

// Define your custom message type with data part schemas
export type MyUIMessage = UIMessage<
  never, // metadata type
  {
    weather: {
      city: string;
      weather?: string;
      status: "loading" | "success";
    };
    notification: {
      message: string;
      level: "info" | "warning" | "error";
    };
  } // data parts type
>;

export async function GET(_request: NextRequest) {
  // const newSteam = new ReadableStream({
  //   start: async (controller) => {
  //     controller.enqueue("hello world");
  //     controller.close();
  //   }
  // });

  const jokeSteam = streamText({
    model: AI_MODEL,
    prompt: "tell me a joke",
  });

  const poemSteam = streamText({
    model: AI_MODEL,
    prompt: "write a one line poem",
  });

  const stream = createUIMessageStream<MyUIMessage>({
    execute: async ({ writer }) => {
      writer.merge(jokeSteam.toUIMessageStream());
      writer.merge(poemSteam.toUIMessageStream());

      writer.write({
        type: "data-weather",
        id: "weather-1",
        data: { city: "San Francisco", status: "loading" },
      });

      writer.write({
        type: "data-weather",
        id: "weather-1",
        data: { city: "San Francisco", status: "loading" },
      });

      writer.write({
        type: "data-notification",
        data: { message: "Processing your request...", level: "info" },
        transient: false, // This part won't be added to message history
      });

      // Wait 2 seconds before naturally completing the stream
      // await new Promise(resolve => setTimeout(resolve, 10000));
    },
  });

  const stream2 = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(stream);
    },
  });

  return createUIMessageStreamResponse({ stream: stream2 });
}
