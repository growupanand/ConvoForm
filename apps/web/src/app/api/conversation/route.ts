import {
  checkNThrowErrorFormSubmissionLimit,
  getORCreateConversation,
  patchConversation,
} from "@/actions";
import { api } from "@/trpc/server";
import {
  type Conversation,
  CoreService,
  type CoreServiceUIMessage,
  createErrorStreamResponse,
  createStreamResponseWithWriter,
} from "@convoform/ai";
import {} from "@convoform/db/src/schema";
import type { UIMessageStreamWriter } from "ai";
import type { NextRequest } from "next/server";
import { z } from "zod";

const newConversationRequestSchema = z.object({
  type: z.literal("new"),
  formId: z.string().min(1),
});

const existingConversationRequestSchema = z.object({
  type: z.literal("existing"),
  formId: z.string().min(1),
  conversationId: z.string().min(1),
  answerText: z.string().min(1),
  currentFieldId: z.string().min(1),
});

const requestSchema = z.discriminatedUnion("type", [
  newConversationRequestSchema,
  existingConversationRequestSchema,
]);

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const parsedRequestBody = await requestSchema.parseAsync(requestBody);

    const formWithFormFields = await api.form.getOneWithFields({
      id: parsedRequestBody.formId,
    });

    if (!formWithFormFields) {
      throw new Error("Form not found");
    }

    await checkNThrowErrorFormSubmissionLimit(formWithFormFields);

    if (parsedRequestBody.type === "new") {
      const newConversation = await getORCreateConversation(formWithFormFields);

      return await createStreamResponseWithWriter<CoreServiceUIMessage>(
        async (writer) => {
          const coreService = new CoreService({
            conversation: {
              ...newConversation,
              form: formWithFormFields,
            },
            onUpdateConversation: createOnUpdateConversationHandler(writer),
          });

          const initialConversationStream = await coreService.initialize();
          writer.merge(initialConversationStream);
        },
      );
    }

    return await createStreamResponseWithWriter<CoreServiceUIMessage>(
      async (writer) => {
        const existConversation = await getORCreateConversation(
          formWithFormFields,
          parsedRequestBody.conversationId,
        );

        const coreService = new CoreService({
          conversation: {
            ...existConversation,
            form: formWithFormFields,
          },
          onUpdateConversation: createOnUpdateConversationHandler(writer),
        });

        const initialConversationStream = await coreService.process(
          parsedRequestBody.answerText,
          parsedRequestBody.currentFieldId,
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
  return async (updatedConversation: Conversation) => {
    await patchConversation(updatedConversation.id, updatedConversation);
    writer.write({
      type: "data-conversation",
      data: updatedConversation,
      id: updatedConversation.id,
    });
  };
}
