import {
  type FormField,
  aiGeneratedFormSchema,
  generateFormSchema,
} from "@convoform/db/src/schema";
import { type NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { sendErrorResponse } from "@/lib/errorHandlers";
import getIP from "@/lib/getIP";
import { getOrgId } from "@/lib/getOrganizationId";
import { GenerateService } from "@convoform/ai";
import { enforceRateLimit } from "@convoform/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const requestJson = await req.json();
    const { formOverview } = generateFormSchema.parse(requestJson);

    const orgId = await getOrgId();
    if (orgId) {
      await enforceRateLimit.AI_PROTECTED_SESSION(orgId);
    } else {
      const clientIp = getIP(req);
      await enforceRateLimit.AI_PUBLIC_SESSION(clientIp);
    }

    const generateFormService = new GenerateService({ formOverview });
    const aiResponseJSON =
      await generateFormService.generateFormDataFromOverview();
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
      formFieldsOrders: [],
    };

    const validAIGeneratedForm = aiGeneratedFormSchema.parse(aiGeneratedForm);

    return NextResponse.json(validAIGeneratedForm);
  } catch (error) {
    return sendErrorResponse(error);
  }
}
