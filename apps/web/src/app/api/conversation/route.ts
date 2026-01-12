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
import { type EdgeTracer, createEdgeTracer } from "@convoform/tracing";
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
  // Initialize tracer for this request
  const tracer = createEdgeTracer("convoform-server");

  // Note: We'll set the trace ID from conversationId below, after we have it

  try {
    const requestBody = await request.json();
    const parsedRequestBody = await requestSchema.parseAsync(requestBody);

    if (parsedRequestBody.type === "new") {
      // For new conversations, we need to create the conversation FIRST
      // so we can use its ID as the trace ID before starting any spans

      // Extract user-agent and geo information from request headers
      const userAgentInformation = userAgent({ headers: await headers() });
      const geoInformation = geolocation({ headers: await headers() });

      // Parse metadata using the schema
      const metaData = await respondentMetadataSchema.parseAsync({
        userAgent: userAgentInformation,
        geoDetails: geoInformation,
      });

      // Get form with fields (before tracing so we can create conversation)
      const formWithFormFields = await getOneFormWithFields(
        parsedRequestBody.formId,
        { db },
      );

      if (!formWithFormFields) {
        throw new Error("Form not found");
      }

      // Check form submission limits
      await checkNThrowErrorFormSubmissionLimit(formWithFormFields);

      // Create new conversation with metadata (before tracing)
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

      // NOW set the trace ID to conversationId - all subsequent spans will use this
      tracer.setTraceId(conversationData.id);

      // Create CoreConversation with form data
      const newConversation = coreConversationSchema.parse({
        ...conversationData,
        form: formWithFormFields,
      });

      const response =
        await createStreamResponseWithWriter<CoreServiceUIMessage>(
          async (writer) => {
            const coreService = new CoreService({
              conversation: newConversation,
              onUpdateConversation: getOnUpdateConversationHandler(writer, {
                db,
                tracer,
              }),
              tracer,
            });

            const initialConversationStream = await coreService.initialize();
            writer.merge(initialConversationStream);
          },
        );

      return response;
    }

    // Existing conversation processing
    const logger = createNextjsLogger().withContext({
      conversationId: parsedRequestBody.coreConversation.id,
    });

    logger.info("Server: Request started");

    // Set trace ID to conversationId so all spans for this conversation share one trace
    tracer.setTraceId(parsedRequestBody.coreConversation.id);

    const response = await createStreamResponseWithWriter<CoreServiceUIMessage>(
      async (writer) => {
        const coreService = new CoreService({
          conversation: parsedRequestBody.coreConversation,
          onUpdateConversation: getOnUpdateConversationHandler(writer, {
            db,
            tracer,
          }),
          tracer,
        });
        logger.info("Server: CoreService initialized");

        const conversationStream = await coreService.process(
          parsedRequestBody.answerText,
          parsedRequestBody.coreConversation.currentFieldId,
        );
        writer.merge(conversationStream);
      },
    );

    return response;
  } catch (error) {
    console.log("\n\n ------> error in conversation route", error);

    // Flush traces even on error
    after(async () => {
      await tracer.flush();
    });

    return createErrorStreamResponse(error as Error);
  }
}

// ================================================================
// ----------------------- HELPERS -----------------------
// ================================================================

function getOnUpdateConversationHandler(
  writer: UIMessageStreamWriter<CoreServiceUIMessage>,
  ctx: ActionContext & {
    tracer?: EdgeTracer;
  },
) {
  return async (updatedConversation: CoreConversation) => {
    try {
      after(async () => {
        await patchConversation(updatedConversation, ctx);
        await ctx.tracer?.flush();
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
