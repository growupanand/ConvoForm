import { openai } from "@ai-sdk/openai";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";

const stream = createUIMessageStream({
  execute({ writer }) {
    // Write custom data parts
    writer.write({
      type: "data-custom",
      id: "custom-1",
      data: "custom-data",
    });

    // Can merge with LLM streams
    const result = streamText({
      model: openai("gpt-4o-mini"),
      prompt: "tell me a joke",
    });

    writer.merge(result.toUIMessageStream());
  },
});

const response = createUIMessageStreamResponse({ stream });
console.log(response);
