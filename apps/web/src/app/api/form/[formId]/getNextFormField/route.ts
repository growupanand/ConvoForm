import { NextResponse } from "next/server";

import { sendErrorResponse } from "@/lib/errorHandlers";
import { GenerateFormFieldService } from "@/lib/services/generateFormField";
import { formSchemaSystemPrompt } from "@/lib/services/systemPrompt";

export async function POST(req: Request) {
  try {
    const requestJson = await req.json();
    const form = formSchemaSystemPrompt.parse(requestJson);

    const generateFormFieldService = new GenerateFormFieldService(form);

    const nextFieldName = await generateFormFieldService.getNextFormField();
    return NextResponse.json({
      fieldName: nextFieldName,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}
