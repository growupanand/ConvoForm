import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";

const routeContextSchema = z.object({
  params: z.object({
    conversationId: z.string(),
  }),
});

export async function GET(
  req: Request,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const organizationId = getOrganizationId();
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        organizationId,
      },
    });
    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
