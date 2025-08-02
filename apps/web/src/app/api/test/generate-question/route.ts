/*
# Test this endpoint with curl:
curl -X POST http://localhost:3000/api/test/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "formOverview": "A business inquiry form for potential clients",
    "currentField": {
      "id": "companyName",
      "fieldName": "companyName",
      "fieldConfiguration": {
        "inputType": "text",
        "inputConfiguration": {
          "placeholder": "Enter your company name"
        }
      }
    },
    "collectedData": [],
    "transcript": [],
    "isFirstQuestion": true
  }'
*/

import { generateFieldQuestion } from "@convoform/ai";
import { type NextRequest, NextResponse } from "next/server";

// Edge runtime compatible
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const {
      formOverview,
      currentField,
      collectedData,
      transcript,
      isFirstQuestion,
    } = await request.json();

    // Validate input
    if (!formOverview || !currentField) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: formOverview and currentField are required",
        },
        { status: 400 },
      );
    }

    // Run question generation
    const result = await generateFieldQuestion({
      formOverview,
      currentField,
      collectedData: collectedData || [],
      transcript: transcript || [],
      isFirstQuestion: isFirstQuestion || false,
    });

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GenerateQuestion test error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate question",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint for simple health check
export async function GET() {
  return NextResponse.json({
    message: "GenerateQuestion endpoint is ready for testing",
    usage: {
      method: "POST",
      endpoint: "/api/test/generate-question",
      body: {
        formOverview: "Form description string",
        currentField: "Current field configuration",
        collectedData: "Previously collected data array",
        transcript: "Conversation history array",
        isFirstQuestion: "Boolean indicating if this is the first question",
      },
    },
    example: {
      formOverview: "A job application form for software engineers",
      currentField: {
        fieldName: "technicalSkills",
        fieldDescription: "Your primary programming languages and technologies",
        fieldValue: null,
      },
      collectedData: [
        {
          fieldName: "fullName",
          fieldDescription: "Your full legal name",
          fieldValue: "John Smith",
        },
      ],
      transcript: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello! What's your name?" },
        { role: "user", content: "My name is John Smith" },
      ],
      isFirstQuestion: false,
    },
  });
}
