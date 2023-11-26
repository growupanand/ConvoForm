import { defaultErrorMessage } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const prisma = new PrismaClient();

const workspaceCreateSchema = z.object({
  name: z.string().min(1).max(255),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const requestJson = await req.json();
    const reqPayload = workspaceCreateSchema.parse(requestJson);
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: reqPayload.name,
        userId: user.id,
      },
    });
    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    }
    return NextResponse.json(
      { nonFieldError: defaultErrorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const workspaces = await prisma.workspace.findMany({
      where: {
        userId: user.id,
      },
    });
    return NextResponse.json(workspaces);
  } catch (error) {
    return NextResponse.json(
      { nonFieldError: defaultErrorMessage },
      { status: 500 }
    );
  }
}
