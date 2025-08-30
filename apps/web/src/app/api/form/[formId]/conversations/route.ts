import { sendErrorMessage, sendErrorResponse } from "@/lib/errorHandlers";
import { api } from "@/trpc/server";
import {
  type FormFieldResponses,
  restoreDateFields,
} from "@convoform/db/src/schema";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  checkNThrowErrorFormSubmissionLimit,
  getORCreateConversation,
} from "../conversation/_utils";

const routeContextSchema = z.object({
  params: z.promise(
    z.object({
      formId: z.string(),
    }),
  ),
});

export async function POST(
  _request: NextRequest,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { formId } = await routeContextSchema.parse(context).params;

    const formWithFormFields = await api.form.getOneWithFields({ id: formId });

    if (!formWithFormFields) {
      return sendErrorMessage("Form not found", 404);
    }

    await checkNThrowErrorFormSubmissionLimit(formWithFormFields);

    const newConversation = await getORCreateConversation(formWithFormFields);

    return Response.json(newConversation);
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const requestJson = await request.json();
    if (requestJson.id === undefined) {
      return sendErrorMessage("Missing conversation id", 400);
    }

    const parsedFormFieldResponses = [] as FormFieldResponses[];

    for (const field of requestJson.formFieldResponses) {
      const parsedFieldConfiguration = restoreDateFields(
        field.fieldConfiguration,
      );
      parsedFormFieldResponses.push({
        ...field,
        fieldConfiguration: parsedFieldConfiguration,
      });
    }
    requestJson.formFieldResponses = parsedFormFieldResponses;

    await api.conversation.patch(requestJson);
    return Response.json({ success: true });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
