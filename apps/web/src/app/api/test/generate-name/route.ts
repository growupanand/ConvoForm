/*
# Test this endpoint with curl:
curl -X POST http://localhost:3000/api/test/generate-name \
  -H "Content-Type: application/json" \
  -d '{
    "formOverview": "A business inquiry form for potential clients",
    "collectedData": [
      {
        "fieldId": "companyName",
        "fieldName": "Company Name",
        "value": "TechCorp Solutions",
        "confidence": 0.95
      },
      {
        "fieldId": "email",
        "fieldName": "Email",
        "value": "contact@techcorp.com",
        "confidence": 0.92
      }
    ],
    "transcript": [
      {
        "speaker": "user",
        "text": "My company name is TechCorp Solutions"
      },
      {
        "speaker": "assistant",
        "text": "Thank you! What\'s your email address?"
      },
      {
        "speaker": "user",
        "text": "It\'s contact@techcorp.com"
      }
    ]
  }'
*/

import { generateConversationName } from "@convoform/ai";
import { type NextRequest, NextResponse } from "next/server";

// Edge runtime compatible
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { formOverview, collectedData, transcript } = await request.json();

    // Validate input
    if (!formOverview || !collectedData) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: formOverview and collectedData are required",
        },
        { status: 400 },
      );
    }

    // Run name generation
    const result = await generateConversationName({
      formOverview,
      collectedData: collectedData || [],
      transcript: transcript || [],
    });

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GenerateName test error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate conversation name",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint for simple health check
export async function GET() {
  return NextResponse.json({
    message: "GenerateName endpoint is ready for testing",
    usage: {
      method: "POST",
      endpoint: "/api/test/generate-name",
      body: {
        formOverview: "Form description string",
        collectedData: "Previously collected data array",
        transcript: "Conversation history array",
      },
    },
    example: {
      formOverview:
        "A comprehensive job application form for software engineers",
      collectedData: [
        {
          fieldName: "fullName",
          fieldDescription: "Your full legal name",
          fieldValue: "John Smith",
        },
        {
          fieldName: "experienceLevel",
          fieldDescription: "Years of experience",
          fieldValue: "7 years",
        },
      ],
      transcript: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello! What's your name?" },
        { role: "user", content: "My name is John Smith" },
      ],
    },
  });
}
