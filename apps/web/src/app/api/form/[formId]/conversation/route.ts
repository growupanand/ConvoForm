import {
  type CollectedData,
  type CollectedFilledData,
  extraStreamDataSchema,
  restoreDateFields,
  selectConversationSchema,
  transcriptSchema,
} from "@convoform/db/src/schema";
import { checkRateLimitThrowError } from "@convoform/rate-limiter";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { sendErrorMessage, sendErrorResponse } from "@/lib/errorHandlers";
import getIP from "@/lib/getIP";
import { ConversationService } from "@convoform/ai";

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
    isFinished: true,
    formId: true,
    collectedData: true,
    id: true,
  })
  .merge(extraStreamDataSchema.pick({ currentField: true }))
  .extend({ transcript: transcriptSchema.array().min(1) });

export async function POST(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { formId } = await routeContextSchema.parse(context).params;
    const { currentField, ...conversation } = await getParsedRequestJson(req);

    if (conversation.formId !== formId) {
      return sendErrorMessage("Conversation not found", 400);
    }

    if (conversation.isFinished) {
      return sendErrorMessage("Conversation already finished", 400);
    }

    const isInitialMessage = currentField === undefined;

    const conversationService = new ConversationService();
    const clientIp = getIP(req);

    // FIXME: Getting vercel edge runtime error for upstash/redis

    await checkRateLimitThrowError({
      identifier: clientIp ?? "unknown",
      rateLimitType: clientIp ? "ai:identified" : "ai:unkown",
    });

    if (!isInitialMessage) {
      // Try to extract the answer from the current conversation messages, and Update conversation with the extracted answer
      const {
        isAnswerExtracted,
        extractedAnswer,
        reasonForFailure,
        otherFieldsData,
      } = await conversationService.extractAnswer({
        ...conversation,
        currentField: currentField,
      });

      // If user provided valid answer for current field
      if (isAnswerExtracted) {
        const updatedFieldsData = conversation.collectedData.map((field) => {
          if (field.fieldName === currentField.fieldName) {
            return {
              ...field,
              fieldValue: extractedAnswer,
            };
          }
          return field;
        });

        conversation.collectedData = updatedFieldsData;
      }

      // If user provided valid answer for other than current field (E.g user provided answer for previous field)
      if (
        isAnswerExtracted === false &&
        reasonForFailure === "wrongField" &&
        otherFieldsData.length > 0
      ) {
        // update valid fields data only
        const validFields = conversation.collectedData.map(
          ({ fieldName }) => fieldName,
        );
        const validOtherFieldsData = otherFieldsData.filter(({ fieldName }) =>
          validFields.includes(fieldName),
        );
        if (validOtherFieldsData.length > 0) {
          const updatedFieldsData = [...conversation.collectedData].map(
            (field) => {
              const updatedFieldValue = validOtherFieldsData.find(
                (f) => f.fieldName === field.fieldName,
              )?.fieldValue;
              if (typeof updatedFieldValue === "string") {
                return {
                  ...field,
                  fieldValue: updatedFieldValue,
                };
              }
              return field;
            },
          );
          conversation.collectedData = updatedFieldsData;
        }
      }
    }

    const nextRequiredField = conversationService.getNextEmptyField(
      conversation.collectedData,
    );
    const isFormSubmissionFinished = nextRequiredField === undefined;

    const { data } = extraStreamDataSchema.safeParse({
      ...conversation,
      collectedData: conversation.collectedData,
      currentField: nextRequiredField,
      isFormSubmissionFinished,
    });
    const extraCustomStreamData = data ?? {};

    if (isFormSubmissionFinished) {
      const { conversationName } =
        await conversationService.generateConversationName({
          formOverview: conversation.formOverview,
          fieldsWithData: conversation.collectedData as CollectedFilledData[],
        });

      extraCustomStreamData.conversationName = conversationName;

      return conversationService.generateEndMessage({
        extraCustomStreamData,
      });
    }

    return conversationService.generateQuestion({
      formOverview: conversation.formOverview,
      currentField: nextRequiredField,
      collectedData: conversation.collectedData,
      extraCustomStreamData,
      transcript: conversation.transcript,
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
