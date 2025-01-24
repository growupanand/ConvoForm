import {
  type FormField,
  aiGeneratedFormSchema,
  generateFormSchema,
} from "@convoform/db/src/schema";
import { type NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { sendErrorResponse } from "@/lib/errorHandlers";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { api } from "@/trpc/server";
import { GenerateFormService } from "@convoform/ai";
import { aiGeneratedFormLimit } from "@convoform/common";
import { checkRateLimitThrowError } from "@convoform/rate-limiter";

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
      formFields: generatedFormFields,
      welcomeScreenData,
      formName,
      isInvalidFormOverview,
      formSummary: generatedFormOverview,
    } = aiResponseJSON;

    if (isInvalidFormOverview === true) {
      throw new Error("Invalid form description.");
    }

    const formFields = generatedFormFields.map(
      (formField: Record<string, any>) => {
        return {
          ...formField,
          fieldConfiguration: {
            inputType: "text",
            inputConfiguration: {},
          },
        } as FormField;
      },
    );

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
