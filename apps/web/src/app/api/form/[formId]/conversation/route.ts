import { NextRequest } from "next/server";
import { checkRateLimitThrowError } from "@convoform/api";
import { Conversation, FieldHavingData } from "@convoform/db/src/schema";
import { z } from "zod";

import { formSubmissionLimit } from "@/lib/config/pricing";
import { sendErrorMessage, sendErrorResponse } from "@/lib/errorHandlers";
import getIP from "@/lib/getIP";
import { ConversationService } from "@/lib/services/conversation";
import { messageSchema } from "@/lib/validations/conversation";
import { api } from "@/trpc/server";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

const requestSchema = z.object({
  conversationId: z.string().optional(),
  messages: z.array(messageSchema),
  currentField: z.string().optional(),
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
    const { conversationId, messages, currentField } =
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
      const fieldsWithEmptyData = form.formFields.map((field) => ({
        fieldName: field.fieldName,
        fieldValue: null,
      }));

      conversation = await api.conversation.create({
        formId,
        name: "New Conversation",
        organizationId: form.organizationId,
        transcript: [],
        fieldsData: fieldsWithEmptyData,
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
        messages,
        currentField,
        formOverview: conversation.formOverview,
      });

      // If user provided valid answer for current field
      if (isAnswerExtracted) {
        const updatedFieldsData = conversation.fieldsData.map((field) => {
          if (field.fieldName === currentField) {
            return {
              ...field,
              fieldValue: extractedAnswer,
            };
          }
          return field;
        });

        await api.conversation.updateFieldsData({
          conversationId: conversation.id,
          fieldsData: updatedFieldsData,
        });
        conversation.fieldsData = updatedFieldsData;
      }

      // If user provided valid answer for other than current field (E.g user provided answer for previous field)
      if (
        isAnswerExtracted === false &&
        reasonForFailure === "wrongField" &&
        otherFieldsData.length > 0
      ) {
        // update valid fields data only
        const validFields = conversation.fieldsData.map(
          ({ fieldName }) => fieldName,
        );
        const validOtherFieldsData = otherFieldsData.filter(({ fieldName }) =>
          validFields.includes(fieldName),
        );
        if (validOtherFieldsData.length > 0) {
          const updatedFieldsData = [...conversation.fieldsData].map(
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

          await api.conversation.updateFieldsData({
            conversationId: conversation.id,
            fieldsData: updatedFieldsData,
          });
          conversation.fieldsData = updatedFieldsData;
        }
      }
    }

    const requiredFieldName = conversationService.getNextEmptyField(
      conversation.fieldsData,
    );

    const isFormSubmissionFinished = requiredFieldName === undefined;

    const extraCustomStreamData = {
      ...conversation,
      currentField: requiredFieldName,
      isFormSubmissionFinished,
    };

    // Save updated conversation transcript in DB
    const onStreamFinish = (generatedQuestionString: string) => {
      const generatedQuestionMessage = {
        role: "assistant",
        content: generatedQuestionString,
        fieldName: requiredFieldName,
      };

      api.conversation.updateTranscript({
        conversationId: conversation.id,
        transcript: [...messages, generatedQuestionMessage],
      });
    };

    // If all fields are filled, mark the conversation as finished, and generate the end message
    if (isFormSubmissionFinished) {
      const { conversationName } =
        await conversationService.generateConversationName({
          formOverview: conversation.formOverview,
          fieldsWithData: conversation.fieldsData as FieldHavingData[],
        });

      await api.conversation.updateFinishedStatus({
        conversationId: conversation.id,
        isFinished: true,
        conversationName,
      });

      return conversationService.generateEndMessage({
        formOverview: conversation.formOverview,
        fieldsWithData: conversation.fieldsData as FieldHavingData[],
        extraCustomStreamData,
        onStreamFinish,
      });
    }

    // Generate the next question
    return conversationService.generateQuestion({
      formOverview: conversation.formOverview,
      requiredFieldName,
      fieldsData: conversation.fieldsData,
      extraCustomStreamData,
      messages,
      onStreamFinish,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
