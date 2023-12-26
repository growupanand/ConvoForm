import prisma from "@/lib/db";
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
    const { formField, ...newFormData } = reqPayload;
    const newForm = await prisma.form.create({
      data: {
        ...newFormData,
        workspaceId: params.workspaceId,
        userId: user.id,
        formField: {
          create: formField,
        },
      },
    });

    // Fetch the newly created formFields although they are created but we don't have it in newForm.
    const newFormFields = await prisma.formField.findMany({
      where: {
        formId: newForm.id,
      },
    });

    const responseJson = {
      ...newForm,
      formField: newFormFields,
    };

    return NextResponse.json(responseJson, { status: 201 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function GET(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const user = await getCurrentUser();
    const workspaceForms = await prisma.form.findMany({
      where: {
        workspaceId: params.workspaceId,
        userId: user.id,
      },
    });

    return NextResponse.json(workspaceForms, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
