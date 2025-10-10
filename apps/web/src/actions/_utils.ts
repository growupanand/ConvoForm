import type { Form } from "@convoform/db/src/schema";

import { getOrganizationFormsCountByFormId } from "@convoform/api/src/actions/conversation/getOrganizationFormsCountByFormId";
import {
  FEATURE_NAMES,
  PLAN_IDS,
  getPlanLimit,
  isOverLimit,
} from "@convoform/common";
import { db } from "@convoform/db";

/**
 * Check if form submission limit is reached
 * @param form
 * @returns
 */
export const checkNThrowErrorFormSubmissionLimit = async (
  form: Pick<Form, "id">,
) => {
  // No limit for demo form
  if (form.id === "demo" || process.env.NODE_ENV === "development") {
    return;
  }

  // get all conversations count for current organization
  const totalSubmissionsCount = await getOrganizationFormsCountByFormId(
    form.id,
    {
      db,
    },
  );

  if (!totalSubmissionsCount) {
    console.error("Unable to get total submissions count", {
      formId: form.id,
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
