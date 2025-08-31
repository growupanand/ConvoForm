import { type UIMessage, createUIMessageStream, streamText } from "ai";
import { getModelConfig } from "../config";

console.log("hello bun");

export const testFakeError = async () => {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Fake error"));
    }, 2000);
  });
};

// Send random text till duration
export const testFakeStream = async (duration: number) => {
  let count = 0;
  return new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        controller.enqueue(count++);
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, duration);
    },
  });
};

export const testFakeUIStream = () => {
  let count = 0;
  return createUIMessageStream<
    UIMessage<
      never,
      {
        name: string;
      }
    >
  >({
    execute: async (options) => {
      options.writer.write({
        type: "data-name",
        data: "utkarsh anand",
      });
      options.writer.write({
        type: "text-delta",
        delta: "utkarsh anand",
        id: "msg1",
      });

      options.writer.write({
        type: "text-start",
        id: "msg2",
      });

      const interval = setInterval(() => {
        count++;
        console.log("sending message", count);
        options.writer.write({
          id: "msg2",
          type: "text-delta",
          delta: count.toString(),
        });
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
      }, 1000);
      new Promise<void>((resolve) => {
        setTimeout(() => {
          options.writer.write({
            type: "data-name",
            data: "final end",
          });
          resolve();
        }, 4000);
      });
    },
  });
};

const main = async () => {
  // try {
  //     const stream = testFakeUIStream();
  //     for await (const chunk of stream) {
  //         console.log("chunk", chunk);
  //     }
  // } catch (error) {
  //     console.error(error);
  // }

  const jokeStream = streamText({
    model: getModelConfig(),
    prompt: "Tell me a joke",
  });

  for await (const chunk of jokeStream.toUIMessageStream()) {
    console.log("chunk", chunk);
  }
};

main();
