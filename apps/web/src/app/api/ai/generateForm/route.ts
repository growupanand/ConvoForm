import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitThrowError } from "@convoform/api";
import {
  aiGeneratedFormSchema,
  generateFormSchema,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { aiGeneratedFormLimit } from "@/lib/config/pricing";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { GenerateFormService } from "@/lib/services/generateForm";
import { api } from "@/trpc/server";

export async function POST(req: NextRequest) {
  try {
    const requestJson = await req.json();
    const { formOverview } = generateFormSchema.parse(requestJson);

    const orgId = getOrganizationId();

    // TODO: After moving AI related routes to tRPC, we can use userId as identifier

    await checkRateLimitThrowError({
      identifier: orgId,
      rateLimitType: "ai:identified",
    });

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
      throw new Error("Invalid form description.");
    }

    const aiGeneratedForm: z.infer<typeof aiGeneratedFormSchema> = {
      name: formName,
      overview: generatedFormOverview,
      welcomeScreenCTALabel: welcomeScreenData?.buttonLabelText,
      welcomeScreenTitle: welcomeScreenData?.pageTitle,
      welcomeScreenMessage: welcomeScreenData?.pageDescription,
      formFields,
    };

    const validAIGeneratedForm = aiGeneratedFormSchema.parse(aiGeneratedForm);

    return NextResponse.json(validAIGeneratedForm);
  } catch (error) {
    return sendErrorResponse(error);
  }
}
