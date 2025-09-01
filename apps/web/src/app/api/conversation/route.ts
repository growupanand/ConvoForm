import { getBackendBaseUrl } from "@/lib/url";
import {
  CoreService,
  type CoreServiceUIMessage,
  createErrorStreamResponse,
  createStreamResponseWithWriter,
} from "@convoform/ai";
import {
  type CoreConversation,
  coreConversationSchema,
} from "@convoform/db/src/schema";
import type { UIMessageStreamWriter } from "ai";
import { type NextRequest, after } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const newConversationRequestSchema = z.object({
  type: z.literal("new"),
  formId: z.string().min(1),
});

const existingConversationRequestSchema = z.object({
  type: z.literal("existing"),
  formId: z.string().min(1),
  answerText: z.string().min(1),
  coreConversation: coreConversationSchema.extend({
    currentFieldId: z.string().min(1),
  }),
});

const requestSchema = z.discriminatedUnion("type", [
  newConversationRequestSchema,
  existingConversationRequestSchema,
]);

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const parsedRequestBody = await requestSchema.parseAsync(requestBody);

    if (parsedRequestBody.type === "new") {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/form/${parsedRequestBody.formId}/conversations`,
        {
          method: "POST",
        },
      );
      const responseJson = await response.json();
      const newConversation = coreConversationSchema.parse(responseJson);

      return await createStreamResponseWithWriter<CoreServiceUIMessage>(
        async (writer) => {
          const coreService = new CoreService({
            conversation: newConversation,
            onUpdateConversation: createOnUpdateConversationHandler(writer),
          });

          const initialConversationStream = await coreService.initialize();
          writer.merge(initialConversationStream);
        },
      );
    }

    return await createStreamResponseWithWriter<CoreServiceUIMessage>(
      async (writer) => {
        const coreService = new CoreService({
          conversation: parsedRequestBody.coreConversation,
          onUpdateConversation: createOnUpdateConversationHandler(writer),
        });

        const initialConversationStream = await coreService.process(
          parsedRequestBody.answerText,
          parsedRequestBody.coreConversation.currentFieldId,
        );
        writer.merge(initialConversationStream);
      },
    );
  } catch (error) {
    console.log("\n\n ------> error in conversation route", error);
    return createErrorStreamResponse(error as Error);
  }
}

// ================================================================
// ----------------------- HELPERS -----------------------
// ================================================================

function createOnUpdateConversationHandler(
  writer: UIMessageStreamWriter<CoreServiceUIMessage>,
) {
  return async (updatedConversation: CoreConversation) => {
    try {
      after(async () => {
        await fetch(
          `${getBackendBaseUrl()}/api/form/${updatedConversation.formId}/conversations`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedConversation),
          },
        );
      });

      writer.write({
        type: "data-conversation",
        data: updatedConversation,
        id: updatedConversation.id,
      });
    } catch (error) {
      console.error("Error updating conversation:", error);
    }
  };
}
