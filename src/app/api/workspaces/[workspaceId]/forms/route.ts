import { NextResponse } from "next/server";
import { z } from "zod";

import { freePlan } from "@/lib/config/pricing";
import prisma from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { getUserId } from "@/lib/getUserId";
import { formCreateSchema } from "@/lib/validations/form";

const routeContextSchema = z.object({
  params: z.object({
    workspaceId: z.string(),
  }),
});

export async function POST(
  req: Request,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const userId = getUserId();
    const organizationId = getOrganizationId();
    const requestJson = await req.json();
    const reqPayload = formCreateSchema.parse(requestJson);
    const { formField, ...newFormData } = reqPayload;

    // Limit the number of forms to 3 per user
    const organizationForms = await prisma.form.findMany({
      where: {
        userId,
      },
    });

    const formCreationLimit =
      freePlan.features.find((feature) => feature.name === "Create forms")
        ?.featureValue ?? 0;

    if (organizationForms.length > formCreationLimit) {
      throw new Error(
        `You can create only ${formCreationLimit} forms in free plan.`,
      );
    }

    const newForm = await prisma.form.create({
      data: {
        ...newFormData,
        workspaceId: params.workspaceId,
        userId: userId,
        organizationId,
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
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const organizationId = getOrganizationId();
    const workspaceForms = await prisma.form.findMany({
      where: {
        workspaceId: params.workspaceId,
        organizationId,
      },
    });

    return NextResponse.json(workspaceForms, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
