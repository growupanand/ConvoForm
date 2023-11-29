import { db } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getCurrentUser } from "@/lib/session";
import { formUpdateSchema } from "@/lib/validations/form";
import { NextResponse } from "next/server";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

export async function PUT(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const user = await getCurrentUser();
    const requestJson = await req.json();
    const reqPayload = formUpdateSchema.parse(requestJson);
    const { journey, ...newFormData } = reqPayload;

    const updatedForm = await db.form.update({
      where: {
        id: params.formId,
        userId: user.id,
      },
      data: {
        ...newFormData,
        journey: {
          deleteMany: {},
          create: journey,
        },
        isPublished: true,
      },
    });

    // Fetch the newly created journeys although they are created but we don't have it in newForm.
    const newJourneys = await db.journey.findMany({
      where: {
        formId: updatedForm.id,
      },
    });

    const responseJson = {
      ...updatedForm,
      journey: newJourneys,
    };

    return NextResponse.json(responseJson, { status: 201 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route params.
    const { params } = routeContextSchema.parse(context);
    const user = await getCurrentUser();
    await db.form.delete({
      where: {
        id: params.formId,
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
