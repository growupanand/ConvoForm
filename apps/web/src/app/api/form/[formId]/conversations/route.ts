import { createConversationWithMetadata } from "@/actions/conversationActions";
import { sendErrorMessage, sendErrorResponse } from "@/lib/errorHandlers";
import { api } from "@/trpc/server";
import {
  type FormFieldResponses,
  restoreDateFields,
} from "@convoform/db/src/schema";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";

export const runtime = "edge";

const routeParamsSchema = z.object({
  formId: z.string().min(1),
});

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ formId: string }> },
) {
  try {
    const routeParams = await context.params;
    const { formId } = routeParamsSchema.parse(routeParams);

    // Use shared action for conversation creation with metadata
    const coreConversation = await createConversationWithMetadata(formId);

    return Response.json(coreConversation);
  } catch (error) {
    console.log("\n\n ------> error in form conversations route", error);
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
