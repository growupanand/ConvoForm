import { createConversationWithMetadata } from "@/actions/conversationActions";
import {
  CoreService,
  type CoreServiceUIMessage,
  createErrorStreamResponse,
  createStreamResponseWithWriter,
} from "@convoform/ai";
import { patchConversation } from "@convoform/api/src/actions/conversation/patchConversation";
import type { ActionContext } from "@convoform/api/src/types/actionContextType";
import { db } from "@convoform/db";
import {
  type CoreConversation,
  coreConversationSchema,
} from "@convoform/db/src/schema";
import type { UIMessageStreamWriter } from "ai";
import { type NextRequest, after } from "next/server";
import { z } from "zod/v4";

export const runtime = "edge";

const newConversationRequestSchema = z.object({
  type: z.literal("new"),
  formId: z.string().min(1),
  coreConversation: z.null(),
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
      // Use shared action for conversation creation with metadata
      const newConversation = await createConversationWithMetadata(
        parsedRequestBody.formId,
      );

      return await createStreamResponseWithWriter<CoreServiceUIMessage>(
        async (writer) => {
          const coreService = new CoreService({
            conversation: newConversation,
            onUpdateConversation: getOnUpdateConversationHandler(writer, {
              db,
            }),
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
          onUpdateConversation: getOnUpdateConversationHandler(writer, {
            db,
          }),
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

function getOnUpdateConversationHandler(
  writer: UIMessageStreamWriter<CoreServiceUIMessage>,
  ctx: ActionContext,
) {
  return async (updatedConversation: CoreConversation) => {
    try {
      after(async () => {
        await patchConversation(updatedConversation, ctx);
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
