import { NextResponse } from "next/server";
import { z } from "zod";

import { sendErrorResponse } from "@/lib/errorHandlers";
import { GenerateFormService } from "@/lib/services/generateForm";
import {
  createGeneratedFormSchema,
  generateFormSchema,
} from "@/lib/validations/form";

export async function POST(req: Request) {
  try {
    const requestJson = await req.json();
    const { formOverview } = generateFormSchema.parse(requestJson);

    const generateFormService = new GenerateFormService({ formOverview });
    const { formFields, welcomeScreenData, formName, isInvalidFormOverview } =
      await generateFormService.getGeneratedFormData();

    if (isInvalidFormOverview == true) {
      throw new Error("Invalid form overview");
    }

    const generatedFormData = {
      name: formName,
      overview: formOverview,
      welcomeScreenCTALabel: welcomeScreenData?.buttonLabelText,
      welcomeScreenTitle: welcomeScreenData?.pageTitle,
      welcomeScreenMessage: welcomeScreenData?.pageDescription,
      formFields:
        Array.isArray(formFields) &&
        formFields.filter(
          (formField: any) => typeof formField?.["fieldName"] === "string",
        ),
    } as z.infer<typeof createGeneratedFormSchema>;

    return NextResponse.json(
      createGeneratedFormSchema.parse(generatedFormData),
    );
  } catch (error) {
    return sendErrorResponse(error);
  }
}
