import {
  type CollectedData,
  type Conversation,
  extraStreamDataSchema,
  restoreDateFields,
  selectConversationSchema,
  transcriptSchema,
} from "@convoform/db/src/schema";
import { enforceRateLimit } from "@convoform/rate-limiter";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { NextRequest } from "next/server";
import { z } from "zod/v3";

import { sendErrorMessage, sendErrorResponse } from "@/lib/errorHandlers";
import getIP from "@/lib/getIP";
import { ConversationServiceV5 as ConversationService } from "@convoform/ai";

export const runtime = "edge";

const routeContextSchema = z.object({
  params: z.promise(
    z.object({
      formId: z.string(),
    }),
  ),
});

export const requestSchema = selectConversationSchema
  .pick({
    formOverview: true,
    finishedAt: true,
    formId: true,
    collectedData: true,
    id: true,
  })
  .merge(extraStreamDataSchema.pick({ currentField: true }))
  .extend({
    transcript: transcriptSchema.array().min(0), // Allow empty transcript for initial question
    isInitialRequest: z.boolean().optional(), // Flag to indicate if this is the first request
  });

export async function POST(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { formId } = await routeContextSchema.parse(context).params;
    const { currentField, isInitialRequest, ...conversation } =
      await getParsedRequestJson(req);

    if (conversation.formId !== formId) {
      return sendErrorMessage("Conversation not found", 400);
    }

    if (conversation.finishedAt) {
      return sendErrorMessage("Conversation already finished", 400);
    }

    const clientIp = getIP(req);

    if (clientIp) {
      await enforceRateLimit.AI_PROTECTED_SESSION(clientIp);
    } else {
      await enforceRateLimit.AI_PUBLIC_SESSION();
    }

    // Determine if this is an initial request or answer processing
    const isInitial = isInitialRequest || conversation.transcript.length === 0;

    let userAnswer: string | undefined;
    let currentFieldToProcess: typeof currentField;

    if (!isInitial) {
      // For answer processing, get the user's answer from the last transcript message
      const lastMessage =
        conversation.transcript[conversation.transcript.length - 1];
      if (!lastMessage || lastMessage.role !== "user") {
        return sendErrorMessage("Invalid request: missing user message", 400);
      }
      userAnswer = lastMessage.content;

      // Find the current field that needs to be processed
      currentFieldToProcess =
        currentField ||
        conversation.collectedData.find((field) => !field.fieldValue);

      if (!currentFieldToProcess) {
        return sendErrorMessage("No field to process", 400);
      }
    }

    // Create a complete conversation object with required fields
    const fullConversation: Conversation = {
      ...conversation,
      name: `Conversation ${conversation.id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: "temp-org-id", // This should come from the form or request context
      isInProgress: !conversation.finishedAt,
      metaData: {
        ipAddress: getIP(req) || "unknown",
        userAgent: {
          ua: req.headers.get("user-agent") || "unknown",
        },
      },
    };

    // Create a UI message stream that combines AI text generation with conversation updates
    const combinedStream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Create conversation service with callback to send updated conversation data
        const conversationService = new ConversationService(fullConversation, {
          onUpdateConversation: async (updatedConversation: Conversation) => {
            console.log(`Conversation ${updatedConversation.id} updated`);

            // Send conversation updates as custom data through the stream
            writer.write({
              type: "data-conversation",
              data: {
                conversation: updatedConversation,
                currentField: updatedConversation.collectedData.find(
                  (field) => !field.fieldValue,
                ),
                collectedData: updatedConversation.collectedData,
                isFormSubmissionFinished:
                  updatedConversation.finishedAt !== null,
              },
            });
          },
        });

        // Handle both initial question generation and answer processing
        let aiMessageStream: Awaited<
          ReturnType<typeof conversationService.generateInitialQuestion>
        >;

        if (isInitial) {
          // Generate initial question for the first field
          aiMessageStream = await conversationService.generateInitialQuestion();
        } else {
          // Process user answer and orchestrate conversation
          if (!userAnswer || !currentFieldToProcess) {
            throw new Error("Missing required data for answer processing");
          }
          aiMessageStream = await conversationService.process(
            userAnswer,
            currentFieldToProcess,
          );
        }

        // Merge the AI text generation stream with our custom data stream
        writer.merge(aiMessageStream);
      },
    });

    // Return the combined UIMessageStream using createUIMessageStreamResponse
    return createUIMessageStreamResponse({
      stream: combinedStream,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const getParsedRequestJson = async (req: NextRequest) => {
  const requestJson = await req.json();

  if (
    requestJson.currentField?.fieldConfiguration?.inputType === "datePicker"
  ) {
    requestJson.currentField.fieldConfiguration = restoreDateFields(
      requestJson.currentField.fieldConfiguration,
    );
  }

  const parsedCollectedData = [] as CollectedData[];

  for (const field of requestJson.collectedData) {
    const parsedFieldConfiguration = restoreDateFields(
      field.fieldConfiguration,
    );
    parsedCollectedData.push({
      ...field,
      fieldConfiguration: parsedFieldConfiguration,
    });
  }
  requestJson.collectedData = parsedCollectedData;

  return requestSchema.parse(requestJson);
};
