import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitThrowError } from "@convoform/api";

import { sendErrorResponse } from "@/lib/errorHandlers";
import getIP from "@/lib/getIP";
import { GenerateFormFieldService } from "@/lib/services/generateFormField";
import { formSchemaSystemPrompt } from "@/lib/services/systemPrompt";

export async function POST(req: NextRequest) {
  try {
    const requestJson = await req.json();
    const form = formSchemaSystemPrompt.parse(requestJson);

    // TODO: After moving AI related routes to tRPC, we can use userId as identifier

    const clientIp = getIP(req);

    await checkRateLimitThrowError({
      identifier: clientIp ?? "unknown",
      rateLimitType: clientIp ? "ai:identified" : "ai:unkown",
    });

    const generateFormFieldService = new GenerateFormFieldService(form);

    const nextFieldName = await generateFormFieldService.getNextFormField();
    return NextResponse.json({
      fieldName: nextFieldName,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
