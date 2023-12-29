import { ConversationService } from "@/lib/services/conversation";
import prisma from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { ConversationPayloadSchema } from "@/lib/validations/conversation";
import { z } from "zod";
import { getUserTotalConversationsCount } from "@/lib/dbControllers/form";

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
    // TODO: Uncomment once premium plan is ready
    // const { isPreview } = reqPayload;
    const isPreview = false;

    const form = await prisma.form.findUnique({
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

    const totalSubmissionsCount = await getUserTotalConversationsCount(
      form.userId
    );

    if (totalSubmissionsCount >= 5) {
      throw new Error("This form have reached the limit submissions", {
        cause: {
          statusCode: 403,
        },
      });
    }

    const conversation = new ConversationService(form, isPreview);

    return conversation.getNextQuestion(reqPayload.messages);
  } catch (error) {
    return sendErrorResponse(error);
  }
}
