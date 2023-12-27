import prisma from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { getUserId } from "@/lib/getUserId";
import { workspaceCreateSchema } from "@/lib/validations/workspace";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const userId = getUserId();
    const organizationId = getOrganizationId();
    const requestJson = await req.json();
    const reqPayload = workspaceCreateSchema.parse(requestJson);
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: reqPayload.name,
        userId: userId,
        organizationId,
      },
    });
    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function GET(req: Request) {
  try {
    const organizationId = getOrganizationId();
    const workspaces = await prisma.workspace.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return NextResponse.json(workspaces);
  } catch (error) {
    return sendErrorResponse(error);
  }
}
