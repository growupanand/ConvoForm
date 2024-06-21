import { NextRequest } from "next/server";
import { checkRateLimitThrowError } from "@convoform/api";
import {
  CollectedData,
  Conversation,
  extraStreamDataSchema,
  FieldHavingData,
  Transcript,
  transcriptSchema,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { formSubmissionLimit } from "@/lib/config/pricing";
import { sendErrorMessage, sendErrorResponse } from "@/lib/errorHandlers";
import getIP from "@/lib/getIP";
import { ConversationService } from "@/lib/services/conversation";
import { api } from "@/trpc/server";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

const requestSchema = extraStreamDataSchema
  .pick({ currentField: true })
  .extend({
    conversationId: z.string().optional(),
    transcript: transcriptSchema.array(),
  });

export async function POST(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const {
      params: { formId },
    } = routeContextSchema.parse(context);
    const requestJson = await req.json();
    const { conversationId, transcript, currentField } =
      requestSchema.parse(requestJson);

    const clientIp = getIP(req);
    await checkRateLimitThrowError({
      identifier: clientIp ?? "unknown",
      rateLimitType: clientIp ? "ai:identified" : "ai:unkown",
    });

    const form = await api.form.getOneWithFields({
      id: formId,
    });

    if (form === undefined) {
      return sendErrorMessage("Form not found", 404);
    }

    if (form.id !== "demo") {
      // get all conversations count for current organization
      const totalSubmissionsCount =
        await api.conversation.getResponseCountByOrganization({
          organizationId: form.organizationId,
        });

      if (!totalSubmissionsCount) {
        console.error("Unable to get total submissions count", {
          organizationId: form.organizationId,
        });
      }

      if (
        totalSubmissionsCount &&
        totalSubmissionsCount > formSubmissionLimit
      ) {
        throw new Error("This form have reached total submissions limit", {
          cause: {
            statusCode: 403,
          },
        });
      }
    }

    const conversationService = new ConversationService();
    let conversation: Conversation;

    // Get the conversation by id or create a new one
    if (!conversationId) {
      const fieldsWithEmptyData: CollectedData[] = form.formFields.map(
        (field) => ({
          fieldName: field.fieldName,
          fieldDescription: field.fieldDescription,
          fieldValue: null,
        }),
      );

      conversation = await api.conversation.create({
        formId,
        name: "New Conversation",
        organizationId: form.organizationId,
        transcript: [],
        collectedData: fieldsWithEmptyData,
        formOverview: form.overview,
      });
    } else {
      const existConversation = await api.conversation.getOne({
        id: conversationId,
      });
      if (existConversation === undefined) {
        return sendErrorMessage("Conversation not found", 404);
      }
      conversation = existConversation;
    }

    // Check if conversation already finished
    if (conversation.isFinished) {
      return sendErrorMessage("Conversation already finished", 400);
    }

    // Try to extract the answer from the current conversation messages, and Update conversation with the extracted answer
    if (currentField !== undefined) {
      const {
        isAnswerExtracted,
        extractedAnswer,
        reasonForFailure,
        otherFieldsData,
      } = await conversationService.extractAnswerFromMessage({
        transcript,
        currentField,
        formOverview: conversation.formOverview,
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

        await api.conversation.updateCollectedData({
          id: conversation.id,
          collectedData: updatedFieldsData,
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

          await api.conversation.updateCollectedData({
            id: conversation.id,
            collectedData: updatedFieldsData,
          });
          conversation.collectedData = updatedFieldsData;
        }
      }
    }

    const requiredField = conversationService.getNextEmptyField(
      conversation.collectedData,
    );

    const isFormSubmissionFinished = requiredField === undefined;

    const { data } = extraStreamDataSchema.safeParse({
      ...conversation,
      currentField: requiredField,
      isFormSubmissionFinished,
    });
    const extraCustomStreamData = data ?? {};

    // Save updated conversation transcript in DB
    const onStreamFinish = (generatedQuestionString: string) => {
      const generatedQuestionMessage: Transcript = transcriptSchema.parse({
        role: "assistant",
        content: generatedQuestionString,
        fieldName: requiredField?.fieldName,
      });

      api.conversation.updateTranscript({
        id: conversation.id,
        transcript: [...transcript, generatedQuestionMessage],
      });
    };

    // If all fields are filled, mark the conversation as finished, and generate the end message
    if (isFormSubmissionFinished) {
      const { conversationName } =
        await conversationService.generateConversationName({
          formOverview: conversation.formOverview,
          fieldsWithData: conversation.collectedData as FieldHavingData[],
        });

      await api.conversation.updateFinishedStatus({
        id: conversation.id,
        isFinished: true,
        name: conversationName,
      });

      return conversationService.generateEndMessage({
        formOverview: conversation.formOverview,
        fieldsWithData: conversation.collectedData as FieldHavingData[],
        extraCustomStreamData,
        onStreamFinish,
      });
    }

    // Generate the next question
    return conversationService.generateQuestion({
      formOverview: conversation.formOverview,
      currentField: requiredField,
      collectedData: conversation.collectedData,
      extraCustomStreamData,
      transcript,
      onStreamFinish,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
