import { NextRequest } from "next/server";
import { Conversation, FieldData } from "@convoform/db";
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
  answer: z.string().optional(),
  messages: z.array(messageSchema),
  currentQuestion: z.string(),
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
  const { conversationId, answer, messages, currentQuestion, currentField } =
    requestSchema.parse(requestJson);

  console.log({
    conversationId,
    answer,
    messages,
    currentQuestion,
    currentField,
  });

  const form = await api.form.getOneWithFields({
    id: formId,
  });

  if (form === undefined) {
    return sendErrorMessage("Form not found", 404);
  }

  let conversation: Conversation;

  if (!conversationId) {
    // Create a new conversation with empty form fields data

    const fieldsData = form.formFields.map((field) => ({
      fieldName: field.fieldName,
      fieldValue: null,
    }));

    const newConversation = await api.conversation.create({
      formId,
      formFieldsData: {},
      name: "New Conversation",
      organizationId: form.organizationId,
      transcript: [],
      fieldsData,
      formOverview: form.overview,
    });
    conversation = {
      ...newConversation,
    };
  } else {
    const existConversation = await api.conversation.getOne({
      id: conversationId,
    });
    if (existConversation === undefined) {
      return sendErrorMessage("Conversation not found", 404);
    }
    conversation = existConversation;
  }

  const ConversationService = new NewConversationService();

  if (currentField !== undefined) {
    // Try to extract the answer from the user message
    const { isAnswerExtracted, extractedAnswer } =
      await ConversationService.extractAnswerFromMessage({
        messages,
        currentField,
        formOverview: form.overview,
      });

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

  const isFormSubmissionFinished = requiredFieldName === undefined;

  const extraStreamData = {
    ...conversation,
    currentField: requiredFieldName,
    isFormSubmissionFinished,
  };

  const onFinal = (completion: string) => {
    // When gpt completes the response, update the conversation transcript with the generated question
    api.conversation.updateTranscript({
      conversationId: conversation.id,
      transcript: [
        ...messages,
        {
          role: "assistant",
          content: completion,
          fieldName: requiredFieldName,
        },
      ],
    });
  };

  const fieldsWithData = conversation.fieldsData.filter(
    (field) => field.fieldValue !== null,
  ) as Array<Omit<FieldData, "fieldValue"> & { fieldValue: string }>;

  // If all fields are filled, return end message
  if (isFormSubmissionFinished) {
    return ConversationService.generateEndMessage({
      formOverview: conversation.formOverview,
      fieldsData: fieldsWithData,
      extraStreamData,
      onFinal,
    });
  }

  return ConversationService.generateQuestion({
    formOverview: conversation.formOverview,
    requiredFieldName,
    fieldsData: conversation.fieldsData,
    extraStreamData,
    messages,
    onFinal,
  });
}
