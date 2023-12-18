import { ConversationService } from "@/lib/services/conversation";
import { db } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { ConversationPayloadSchema } from "@/lib/validations/conversation";
import { NextResponse } from "next/server";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

export async function POST(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const requestJson = await req.json();
    const reqPayload = ConversationPayloadSchema.parse(requestJson);
    const { isConversationFinished, isPreview } = reqPayload;

    const form = await db.form.findUnique({
      where: {
        id: params.formId,
      },
      include: {
        formField: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!form) {
      throw new Error("Form not found", {
        cause: {
          statusCode: 404,
        },
      });
    }

    const conversation = new ConversationService(form);

    if (!isConversationFinished) {
      return conversation.getNextQuestion(reqPayload.messages);
    }

    if (!isPreview) {
      await conversation.saveConversation(reqPayload.messages);
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
      }
    );
  } catch (error) {
    return sendErrorResponse(error);
  }
}
