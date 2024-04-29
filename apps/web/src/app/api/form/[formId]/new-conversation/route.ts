import { NextRequest } from "next/server";
import { Conversation, FieldHavingData } from "@convoform/db";
import { z } from "zod";

import { sendErrorMessage } from "@/lib/errorHandlers";
import { NewConversationService } from "@/lib/services/newConversation";
import { messageSchema } from "@/lib/validations/form";
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
  const {
    params: { formId },
  } = routeContextSchema.parse(context);
  const requestJson = await req.json();
  const { conversationId, messages, currentField } =
    requestSchema.parse(requestJson);
  const ConversationService = new NewConversationService();
  let conversation: Conversation;

  const form = await api.form.getOneWithFields({
    id: formId,
  });

  if (form === undefined) {
    return sendErrorMessage("Form not found", 404);
  }

  // Get the conversation by id or create a new one
  if (!conversationId) {
    const fieldsWithEmptyData = form.formFields.map((field) => ({
      fieldName: field.fieldName,
      fieldValue: null,
    }));

    conversation = await api.conversation.create({
      formId,
      formFieldsData: {},
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

  // Try to extract the answer from the current conversation messages
  if (currentField !== undefined) {
    const { isAnswerExtracted, extractedAnswer } =
      await ConversationService.extractAnswerFromMessage({
        messages,
        currentField,
        formOverview: conversation.formOverview,
      });

    console.log({ isAnswerExtracted, extractedAnswer, currentField });

    if (isAnswerExtracted) {
      // Update conversation with the extracted answer

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
  }

  const requiredFieldName = ConversationService.getNextEmptyField(
    conversation.fieldsData,
  );
  console.log({ requiredFieldName, fields: conversation.fieldsData });

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
      await ConversationService.generateConversationName({
        formOverview: conversation.formOverview,
        fieldsWithData: conversation.fieldsData as FieldHavingData[],
      });

    await api.conversation.updateFinishedStatus({
      conversationId: conversation.id,
      isFinished: true,
      conversationName,
    });

    return ConversationService.generateEndMessage({
      formOverview: conversation.formOverview,
      fieldsWithData: conversation.fieldsData as FieldHavingData[],
      extraCustomStreamData,
      onStreamFinish,
    });
  }

  // Generate the next question
  return ConversationService.generateQuestion({
    formOverview: conversation.formOverview,
    requiredFieldName,
    fieldsData: conversation.fieldsData,
    extraCustomStreamData,
    messages,
    onStreamFinish,
  });
}
