import prisma from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/getUserId";

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
        conversation: true,
      },
    });
    const conversations = form?.conversation;
    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
