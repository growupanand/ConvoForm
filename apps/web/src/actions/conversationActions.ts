import { checkNThrowErrorFormSubmissionLimit } from "@/actions";
import { api } from "@/trpc/server";
import {
  type CoreConversation,
  coreConversationSchema,
  respondentMetadataSchema,
} from "@convoform/db/src/schema";
import { geolocation } from "@vercel/functions";
import { headers } from "next/headers";
import { userAgent } from "next/server";

/**
 * Creates a new conversation with proper user-agent and geo information
 * This action extracts the common logic shared between conversation routes
 * @param formId - The ID of the form to create conversation for
 * @param conversationId - Optional existing conversation ID
 * @returns CoreConversation with form data
 */
export const createConversationWithMetadata = async (
  formId: string,
  conversationId?: string,
): Promise<CoreConversation> => {
  // Extract user-agent and geo information from request headers
  const userAgentInformation = userAgent({ headers: await headers() });
  const geoInformation = geolocation({ headers: await headers() });

  // Parse metadata using the schema
  const metaData = await respondentMetadataSchema.parseAsync({
    userAgent: userAgentInformation,
    geoDetails: geoInformation,
  });

  // Get form with fields
  const formWithFormFields = await api.form.getOneWithFields({
    id: formId,
  });

  if (!formWithFormFields) {
    throw new Error("Form not found");
  }

  // Check form submission limits
  await checkNThrowErrorFormSubmissionLimit(formWithFormFields);

  // Create or get existing conversation
  let conversationData: any;

  if (conversationId) {
    // Get existing conversation
    const existingConversation = await api.conversation.getOne({
      id: conversationId,
    });
    if (!existingConversation) {
      throw new Error("Conversation not found");
    }
    conversationData = existingConversation;
  } else {
    // Create new conversation with metadata
    const fieldsWithEmptyData = formWithFormFields.formFields.map((field) => ({
      id: field.id,
      fieldName: field.fieldName,
      fieldDescription: field.fieldDescription,
      fieldValue: null,
      fieldConfiguration: field.fieldConfiguration,
    }));

    conversationData = await api.conversation.create({
      formId: formWithFormFields.id,
      name: "New Conversation",
      organizationId: formWithFormFields.organizationId,
      transcript: [],
      formFieldResponses: fieldsWithEmptyData,
      formOverview: formWithFormFields.overview,
      metaData, // Pass the extracted metadata here
    });
  }

  // Return CoreConversation with form data
  const coreConversation = coreConversationSchema.parse({
    ...conversationData,
    form: formWithFormFields,
  });

  return coreConversation;
};
