import {
  type UIMessage,
  type UIMessageStreamWriter,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

/**
 * Helper function that creates a stream with writer access and automatically handles createUIMessageStreamResponse
 * @param streamLogic - Function that receives the writer and can perform streaming operations
 * @returns Response with the stream
 */
export async function createStreamResponseWithWriter<T extends UIMessage>(
  streamLogic: (writer: UIMessageStreamWriter<T>) => Promise<void>,
) {
  const stream = createUIMessageStream<T>({
    execute: async ({ writer }) => {
      await streamLogic(writer);
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
}

export async function createErrorStreamResponse<T extends UIMessage>(
  error: Error | string,
  errorId?: string,
) {
  return createStreamResponseWithWriter<T>(async (writer) => {
    writer.write({
      type: "error",
      id: errorId,
      errorText: error instanceof Error ? error.message : error,
    });
  });
}
