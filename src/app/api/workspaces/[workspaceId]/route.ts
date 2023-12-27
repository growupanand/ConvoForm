import prisma from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { workspaceUpdateSchema } from "@/lib/validations/workspace";
import { NextResponse } from "next/server";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    workspaceId: z.string(),
  }),
});

export async function DELETE(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route params.
    const { params } = routeContextSchema.parse(context);
    const organizationId = getOrganizationId();
    await prisma.workspace.delete({
      where: {
        id: params.workspaceId,
        organizationId,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function PUT(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route params.
    const { params } = routeContextSchema.parse(context);
    const organizationId = getOrganizationId();
    const reqJson = await req.json();
    const { name } = workspaceUpdateSchema.parse(reqJson);
    const workspace = await prisma.workspace.update({
      where: {
        id: params.workspaceId,
        organizationId,
      },
      data: {
        name,
      },
    });
    return NextResponse.json(workspace, { status: 200 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
