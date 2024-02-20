import { NextResponse } from "next/server";
import { z } from "zod";

import { aiGeneratedFormLimit } from "@/lib/config/pricing";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { GenerateFormService } from "@/lib/services/generateForm";
import {
  createGeneratedFormSchema,
  generateFormSchema,
} from "@/lib/validations/form";
import { api } from "@/trpc/server";

export async function POST(req: Request) {
  try {
    const requestJson = await req.json();
    const { formOverview } = generateFormSchema.parse(requestJson);

    const orgId = getOrganizationId();

    // Check current plan usage and limit
    const aiGeneratedFormsCount =
      await api.form.getAIGeneratedCountByOrganization({
        organizationId: orgId,
      });
    if (
      aiGeneratedFormsCount &&
      aiGeneratedFormsCount >= aiGeneratedFormLimit
    ) {
      throw new Error("AI generated form limit reached");
    }

    const generateFormService = new GenerateFormService({ formOverview });
    const aiResponseJSON = await generateFormService.getGeneratedFormData();
    const {
      formFields,
      welcomeScreenData,
      formName,
      isInvalidFormOverview,
      formSummary: generatedFormOverview,
    } = aiResponseJSON;

    if (isInvalidFormOverview == true) {
      throw new Error("Invalid form overview");
    }

    const generatedFormData = {
      name: formName,
      overview: generatedFormOverview,
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
