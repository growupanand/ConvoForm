import { checkNThrowErrorFormSubmissionLimit } from "@/actions";
import { createNextjsLogger } from "@/lib/logger";
import {
  CoreService,
  type CoreServiceUIMessage,
  createErrorStreamResponse,
  createStreamResponseWithWriter,
} from "@convoform/ai";
import {
  createConversation,
  patchConversation,
} from "@convoform/api/src/actions/conversation";
import { getOneFormWithFields } from "@convoform/api/src/actions/form";
import type { ActionContext } from "@convoform/api/src/types/actionContextType";
import { db } from "@convoform/db";
import {
  type CoreConversation,
  coreConversationSchema,
  respondentMetadataSchema,
} from "@convoform/db/src/schema";
import { geolocation } from "@vercel/functions";
import type { UIMessageStreamWriter } from "ai";
import { headers } from "next/headers";
import { type NextRequest, after, userAgent } from "next/server";
import { z } from "zod/v4";

export const runtime = "edge";
export const maxDuration = 60;

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
      // Extract user-agent and geo information from request headers
      const userAgentInformation = userAgent({ headers: await headers() });
      const geoInformation = geolocation({ headers: await headers() });

      // Parse metadata using the schema
      const metaData = await respondentMetadataSchema.parseAsync({
        userAgent: userAgentInformation,
        geoDetails: geoInformation,
      });

      // Get form with fields
      const formWithFormFields = await getOneFormWithFields(
        parsedRequestBody.formId,
        {
          db,
        },
      );

      if (!formWithFormFields) {
        throw new Error("Form not found");
      }

      // Check form submission limits
      await checkNThrowErrorFormSubmissionLimit(formWithFormFields);

      // Create new conversation with metadata
      const fieldsWithEmptyData = formWithFormFields.formFields.map(
        (field) => ({
          id: field.id,
          fieldName: field.fieldName,
          fieldDescription: field.fieldDescription,
          fieldValue: null,
          fieldConfiguration: field.fieldConfiguration,
        }),
      );

      const conversationData = await createConversation(
        {
          formId: formWithFormFields.id,
          name: "New Conversation",
          organizationId: formWithFormFields.organizationId,
          transcript: [],
          formFieldResponses: fieldsWithEmptyData,
          formOverview: formWithFormFields.overview,
          metaData,
        },
        { db },
      );

      // Create CoreConversation with form data
      const newConversation = coreConversationSchema.parse({
        ...conversationData,
        form: formWithFormFields,
      });

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

    const logger = createNextjsLogger().withContext({
      conversationId: parsedRequestBody.coreConversation.id,
    });

    logger.info("Server: Request started");

    return await createStreamResponseWithWriter<CoreServiceUIMessage>(
      async (writer) => {
        const coreService = new CoreService({
          conversation: parsedRequestBody.coreConversation,
          onUpdateConversation: getOnUpdateConversationHandler(writer, {
            db,
          }),
        });
        logger.info("Server: CoreService initialized");

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
