import { extractFieldAnswer } from "@convoform/ai";
/*
# Test this endpoint with curl:
curl -X POST http://localhost:3000/api/test/extract-answer \
  -H "Content-Type: application/json" \
  -d '{
    "formOverview": "A business inquiry form for potential clients",
    "field": {
      "id": "companyName",
      "fieldName": "companyName",
      "fieldConfiguration": {
        "inputType": "text",
        "inputConfiguration": {
          "placeholder": "Enter your company name"
        }
      }
    },
    "transcript": [
      {
        "speaker": "user",
        "text": "My company name is TechCorp Solutions"
      }
    ]
  }'
*/

import { type NextRequest, NextResponse } from "next/server";

// Edge runtime compatible
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { transcript, currentField, formOverview } = await request.json();

    // Validate input
    if (!transcript || !currentField || !formOverview) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Run extraction
    const result = await extractFieldAnswer({
      transcript,
      currentField,
      formOverview,
    });

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ExtractAnswer test error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract answer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint for simple health check
export async function GET() {
  return NextResponse.json({
    message: "ExtractAnswer endpoint is ready for testing",
    usage: {
      method: "POST",
      endpoint: "/api/test/extract-answer",
      body: {
        transcript: "Array of conversation messages",
        currentField: "Current field configuration",
        formOverview: "Form description string",
      },
    },
    example: {
      transcript: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "What's your name?" },
        { role: "user", content: "My name is John Smith" },
      ],
      currentField: {
        fieldName: "fullName",
        fieldDescription: "Your full legal name",
        fieldValue: null,
      },
      formOverview: "A job application form",
    },
  });
}
