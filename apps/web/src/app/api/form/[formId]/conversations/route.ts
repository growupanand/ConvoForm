import { createConversationWithMetadata } from "@/actions/conversationActions";
import { attachConversationToken } from "@/lib/conversationToken";
import { sendErrorResponse } from "@/lib/errorHandlers";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";

export const runtime = "nodejs";

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

    return await attachConversationToken(Response.json(coreConversation), {
      conversationId: coreConversation.id,
      formId: coreConversation.formId,
      organizationId: coreConversation.organizationId,
    });
  } catch (error) {
    console.log("\n\n ------> error in form conversations route", error);
    return sendErrorResponse(error);
  }
}
