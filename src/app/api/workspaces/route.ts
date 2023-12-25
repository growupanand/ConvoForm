import { db } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getCurrentUser } from "@/lib/session";
import { workspaceCreateSchema } from "@/lib/validations/workspace";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const requestJson = await req.json();
    const reqPayload = workspaceCreateSchema.parse(requestJson);
    const newWorkspace = await db.workspace.create({
      data: {
        name: reqPayload.name,
        userId: user.id,
      },
    });
    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const workspaces = await db.workspace.findMany({
      where: {
        userId: user.id,
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
