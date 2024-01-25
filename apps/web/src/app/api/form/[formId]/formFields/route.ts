import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

export async function GET(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const form = await prisma.formField.findMany({
      where: {
        formId: params.formId,
      },
    });
    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
