import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
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
    const user = await getCurrentUser();
    await db.workspace.delete({
      where: {
        id: params.workspaceId,
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(error.issues, { status: 422 });
    }

    return NextResponse.json(null, { status: 500 });
  }
}
