import { createDataStreamResponse } from "ai";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  let index = 0;

  return createDataStreamResponse({
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Type": "text/event-stream",
    },

    execute: async (dataStream) => {
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dataStream.writeMessageAnnotation(`hello world - ${index++}`);
      }
    },
  });
}
