import { defaultErrorMessage } from "@/lib/constants";
import { db } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getCurrentUser } from "@/lib/session";
import { formCreateSchema } from "@/lib/validations/form";
import { NextResponse } from "next/server";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    workspaceId: z.string(),
  }),
});

export async function POST(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const user = await getCurrentUser();
    const requestJson = await req.json();
    const reqPayload = formCreateSchema.parse(requestJson);
    const { journey, ...newFormData } = reqPayload;
    const newForm = await db.form.create({
      data: {
        ...newFormData,
        workspaceId: params.workspaceId,
        userId: user.id,
        journey: {
          create: journey,
        },
      },
    });

    // Fetch the newly created journeys although they are created but we don't have it in newForm.
    const newJourneys = await db.journey.findMany({
      where: {
        formId: newForm.id,
      },
    });

    const responseJson = {
      ...newForm,
      journey: newJourneys,
    };

    return NextResponse.json(responseJson, { status: 201 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
