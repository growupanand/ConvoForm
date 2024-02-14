import { z } from "zod";

import { formSubmissionLimit } from "@/lib/config/pricing";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { ConversationService } from "@/lib/services/conversation";
import { ConversationPayloadSchema } from "@/lib/validations/conversation";
import { api } from "@/trpc/server";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

export async function POST(
  req: Request,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const requestJson = await req.json();
    const reqPayload = ConversationPayloadSchema.parse(requestJson);
    // TODO: Uncomment once premium plan is ready
    // const { isPreview } = reqPayload;
    const isPreview = false;

    const form = await api.form.getOneWithFields({
      id: params.formId,
    });

    if (!form) {
      throw new Error("Form not found", {
        cause: {
          statusCode: 404,
        },
      });
    }

    if (form.id !== "demo") {
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

      if (
        totalSubmissionsCount &&
        totalSubmissionsCount > formSubmissionLimit
      ) {
        throw new Error("This form have reached total submissions limit", {
          cause: {
            statusCode: 403,
          },
        });
      }
    }

    const conversation = new ConversationService(form, isPreview);

    return conversation.getNextQuestion(reqPayload.messages);
  } catch (error) {
    return sendErrorResponse(error);
  }
}
