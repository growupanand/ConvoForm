import { checkRateLimitThrowError } from "@convoform/api";
import {
  type CollectedFilledData,
  type Transcript,
  extraStreamDataSchema,
  restoreDateFields,
  transcriptSchema,
} from "@convoform/db/src/schema";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { sendErrorMessage, sendErrorResponse } from "@/lib/errorHandlers";
import getIP from "@/lib/getIP";
import { ConversationService } from "@/lib/services/conversation";
import { api } from "@/trpc/server";
import {
  checkNThrowErrorFormSubmissionLimit,
  getORCreateConversation,
} from "./_utils";

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

    if (
      requestJson.currentField?.fieldConfiguration?.inputType === "datePicker"
    ) {
      requestJson.currentField.fieldConfiguration = restoreDateFields(
        requestJson.currentField.fieldConfiguration,
      );
    }

    const { conversationId, transcript, currentField } =
      requestSchema.parse(requestJson);
    const isInitialMessage = currentField === undefined;

    const conversationService = new ConversationService();
    const clientIp = getIP(req);

    await checkRateLimitThrowError({
      identifier: clientIp ?? "unknown",
      rateLimitType: clientIp ? "ai:identified" : "ai:unkown",
    });

    const existForm = await api.form.getOneWithFields({
      id: formId,
    });
    if (existForm === undefined) {
      return sendErrorMessage("Form not found", 404);
    }
    await checkNThrowErrorFormSubmissionLimit(existForm);

    const existConversation = await getORCreateConversation(
      existForm,
      conversationId,
    );

    if (existConversation.isFinished) {
      return sendErrorMessage("Conversation already finished", 400);
    }

    if (!isInitialMessage) {
      // Try to extract the answer from the current conversation messages, and Update conversation with the extracted answer
      const {
        isAnswerExtracted,
        extractedAnswer,
        reasonForFailure,
        otherFieldsData,
      } = await conversationService.extractAnswer({
        transcript,
        currentField,
        formOverview: existConversation.formOverview,
      });

      // If user provided valid answer for current field
      if (isAnswerExtracted) {
        const updatedFieldsData = existConversation.collectedData.map(
          (field) => {
            if (field.fieldName === currentField.fieldName) {
              return {
                ...field,
                fieldValue: extractedAnswer,
              };
            }
            return field;
          },
        );

        await api.conversation.updateCollectedData({
          id: existConversation.id,
          collectedData: updatedFieldsData,
        });
        existConversation.collectedData = updatedFieldsData;
      }

      // If user provided valid answer for other than current field (E.g user provided answer for previous field)
      if (
        isAnswerExtracted === false &&
        reasonForFailure === "wrongField" &&
        otherFieldsData.length > 0
      ) {
        // update valid fields data only
        const validFields = existConversation.collectedData.map(
          ({ fieldName }) => fieldName,
        );
        const validOtherFieldsData = otherFieldsData.filter(({ fieldName }) =>
          validFields.includes(fieldName),
        );
        if (validOtherFieldsData.length > 0) {
          const updatedFieldsData = [...existConversation.collectedData].map(
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
            id: existConversation.id,
            collectedData: updatedFieldsData,
          });
          existConversation.collectedData = updatedFieldsData;
        }
      }
    }

    const nextRequiredField = conversationService.getNextEmptyField(
      existConversation.collectedData,
    );
    const isFormSubmissionFinished = nextRequiredField === undefined;

    const { data } = extraStreamDataSchema.safeParse({
      ...existConversation,
      currentField: nextRequiredField,
      isFormSubmissionFinished,
    });
    const extraCustomStreamData = data ?? {};

    // Save updated conversation transcript in DB
    const onStreamFinish = (generatedQuestionString: string) => {
      const generatedQuestionMessage: Transcript = transcriptSchema.parse({
        role: "assistant",
        content: generatedQuestionString,
        fieldName: nextRequiredField?.fieldName,
      });

      api.conversation.updateTranscript({
        id: existConversation.id,
        transcript: [...transcript, generatedQuestionMessage],
      });
    };

    if (isFormSubmissionFinished) {
      const { conversationName } =
        await conversationService.generateConversationName({
          formOverview: existConversation.formOverview,
          fieldsWithData:
            existConversation.collectedData as CollectedFilledData[],
        });

      await api.conversation.updateFinishedStatus({
        id: existConversation.id,
        isFinished: true,
        name: conversationName,
      });

      return conversationService.generateEndMessage({
        formOverview: existConversation.formOverview,
        fieldsWithData:
          existConversation.collectedData as CollectedFilledData[],
        extraCustomStreamData,
        onStreamFinish,
      });
    }

    return conversationService.generateQuestion({
      formOverview: existConversation.formOverview,
      currentField: nextRequiredField,
      collectedData: existConversation.collectedData,
      extraCustomStreamData,
      transcript,
      onStreamFinish,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
