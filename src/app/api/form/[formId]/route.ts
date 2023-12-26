import prisma from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getUserId } from "@/lib/getUserId";
import { formPatchSchema, formUpdateSchema } from "@/lib/validations/form";
import { NextResponse } from "next/server";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

export async function GET(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const userId = getUserId();
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        userId: userId,
      },
      include: {
        formField: true,
        workspace: true,
      },
    });
    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function PUT(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const userId = getUserId();
    const requestJson = await req.json();
    const reqPayload = formUpdateSchema.parse(requestJson);
    const { formField: formField, ...newFormData } = reqPayload;

    const updatedForm = await prisma.form.update({
      where: {
        id: params.formId,
        userId: userId,
      },
      data: {
        ...newFormData,
        formField: {
          deleteMany: {},
          create: formField,
        },
        isPublished: true,
      },
    });

    // Fetch the newly created formFields although they are created but we don't have it in newForm.
    const newformFields = await prisma.formField.findMany({
      where: {
        formId: updatedForm.id,
      },
    });

    const responseJson = {
      ...updatedForm,
      formField: newformFields,
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
    const userId = getUserId();
    await prisma.form.delete({
      where: {
        id: params.formId,
        userId: userId,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function PATCH(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const userId = getUserId();
    const requestJson = await req.json();
    const reqPayload = formPatchSchema.parse(requestJson);
    const { formField, ...newFormData } = reqPayload;

    const newData = {
      ...newFormData,
    } as Record<string, any>;

    if (formField) {
      newData.formField = {
        deleteMany: {},
        create: formField,
      };
    }

    const updatedForm = await prisma.form.update({
      where: {
        id: params.formId,
        userId: userId,
      },
      data: newData,
    });

    // Fetch the newly created formFields although they are created but we don't have it in newForm.
    const newformFields = await prisma.formField.findMany({
      where: {
        formId: updatedForm.id,
      },
    });

    const responseJson = {
      ...updatedForm,
      formField: newformFields,
    };

    return NextResponse.json(responseJson, { status: 201 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
