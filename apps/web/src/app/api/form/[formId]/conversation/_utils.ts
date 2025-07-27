import type {
  CollectedData,
  CreateConversation,
  Form,
} from "@convoform/db/src/schema";

import {
  FEATURE_NAMES,
  PLAN_IDS,
  getPlanLimit,
  isOverLimit,
} from "@convoform/common";

import { api } from "@/trpc/server";

/**
 * Returns a conversation or creates a new one
 * @param form
 * @param conversationId
 * @returns
 */
export const getORCreateConversation = async (
  form: CreateConversation,
  conversationId?: string,
) => {
  if (conversationId) {
    const existConversation = await api.conversation.getOne({
      id: conversationId,
    });
    if (!existConversation) {
      throw new Error("Conversation not found");
    }

    return existConversation;
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
export const checkNThrowErrorFormSubmissionLimit = async (
  form: Pick<Form, "id" | "organizationId">,
) => {
  // No limit for demo form
  if (form.id === "demo" || process.env.NODE_ENV === "development") {
    return;
  }

  // get all conversations count for current organization
  const totalSubmissionsCount = await api.conversation.getCountByOrganizationId(
    {
      organizationId: form.organizationId,
    },
  );

  if (!totalSubmissionsCount) {
    console.error("Unable to get total submissions count", {
      organizationId: form.organizationId,
    });
  }

  // Check if usage exceeds the plan limit using new pricing helpers
  if (
    totalSubmissionsCount &&
    isOverLimit(
      totalSubmissionsCount,
      PLAN_IDS.FREE, // TODO: Replace with actual user's plan ID
      FEATURE_NAMES.FORM_RESPONSES,
    )
  ) {
    const limit = getPlanLimit(PLAN_IDS.FREE, FEATURE_NAMES.FORM_RESPONSES);
    throw new Error(
      `Form submissions limit exceeded. Maximum ${limit} responses allowed.`,
      {
        cause: {
          statusCode: 403,
        },
      },
    );
  }
};
