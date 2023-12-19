import { db } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getCurrentUser } from "@/lib/session";
import { formPatchSchema, formUpdateSchema } from "@/lib/validations/form";
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
    const { formField: formField, ...newFormData } = reqPayload;

    const updatedForm = await db.form.update({
      where: {
        id: params.formId,
        userId: user.id,
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
    const newformFields = await db.formField.findMany({
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

export async function PATCH(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const user = await getCurrentUser();
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

    const updatedForm = await db.form.update({
      where: {
        id: params.formId,
        userId: user.id,
      },
      data: newData,
    });

    // Fetch the newly created formFields although they are created but we don't have it in newForm.
    const newformFields = await db.formField.findMany({
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
