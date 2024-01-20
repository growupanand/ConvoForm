import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";

export async function GET() {
  try {
    const organizationId = getOrganizationId();

    const formsCount = await prisma.form.count({
      where: {
        organizationId,
      },
    });

    return NextResponse.json(
      {
        formsCount,
      },
      { status: 200 },
    );
  } catch (error) {
    return sendErrorResponse(error);
  }
}
