import { CollectedData, Form, FormField } from "@convoform/db/src/schema";

import { formSubmissionLimit } from "@/lib/config/pricing";
import { api } from "@/trpc/server";

/**
 * Returns a conversation or creates a new one
 * @param form
 * @param conversationId
 * @returns
 */
export const getConversation = async (
  form: Form & { formFields: FormField[] },
  conversationId?: string,
) => {
  if (conversationId) {
    return await api.conversation.getOne({
      id: conversationId,
    });
  }

  const fieldsWithEmptyData: CollectedData[] = form.formFields.map((field) => ({
    fieldName: field.fieldName,
    fieldDescription: field.fieldDescription,
    fieldValue: null,
    fieldConfiguration: field.fieldConfiguration,
  }));

  return await api.conversation.create({
    formId: form.id,
    name: "New Conversation",
    organizationId: form.organizationId,
    transcript: [],
    collectedData: fieldsWithEmptyData,
    formOverview: form.overview,
  });
};

/**
 * Check if form submission limit is reached
 * @param form
 * @returns
 */
export const checkNThrowErrorFormSubmissionLimit = async (form: Form) => {
  // No limit for demo form
  if (form.id === "demo") {
    return;
  }

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

  if (totalSubmissionsCount && totalSubmissionsCount > formSubmissionLimit) {
    throw new Error("This form have reached total submissions limit", {
      cause: {
        statusCode: 403,
      },
    });
  }
};
