import { ConversationServiceV5 } from "@convoform/ai";
import type { Conversation } from "@convoform/db/src/schema";
import { createUIMessageStreamResponse } from "ai";
import { NextResponse } from "next/server";

export async function GET() {
  const sampleConversation: Conversation = {
    id: "a0xhbftidlshue233wd86bj9",
    createdAt: new Date("2025-04-17 18:18:00.861"),
    updatedAt: new Date("2025-04-17 18:18:37.933"),
    name: "New Conversation",
    transcript: [
      { role: "user", content: "Hi" },
      {
        role: "assistant",
        content: "Hello! To start, may I have your full name for the feedback?",
        fieldName: "Full Name",
      },
      { role: "user", content: "my name is utkarsh anand" },
      {
        role: "assistant",
        content:
          "Great, thank you. Moving on, I will need your email address for the feedback. Can you please provide it?",
        fieldName: "Email Address",
      },
    ],
    formId: "demo",
    organizationId: "org_2aEa6kfAdQkzIzwTiah48mNscE9",
    formFieldResponses: [
      {
        id: "1",
        fieldName: "Full Name",
        fieldValue: "utkarsh anand",
        fieldDescription: "Full Name",
        fieldConfiguration: { inputType: "text", inputConfiguration: {} },
      },
      {
        id: "2",
        fieldName: "Email Address",
        fieldValue: null,
        fieldDescription: "Email Address",
        fieldConfiguration: { inputType: "text", inputConfiguration: {} },
      },
      {
        id: "3",
        fieldName: "Rating",
        fieldValue: null,
        fieldDescription: "How would you rate our services?",
        fieldConfiguration: {
          inputType: "multipleChoice",
          inputConfiguration: {
            options: [
              { value: "🌟 Excellent" },
              { value: "😊 Good" },
              { value: "😐 Average" },
              { value: "😞 Needs Improvement" },
            ],
          },
        },
      },
      {
        id: "4",
        fieldName: "What aspects do you think we can improve?",
        fieldValue: null,
        fieldDescription: "What aspects do you think we can improve?",
        fieldConfiguration: { inputType: "text", inputConfiguration: {} },
      },
    ],
    formOverview:
      "This is a feedback for website convoform.com, I want to know about the user details and there feedback about the product.",
    finishedAt: null,
    isInProgress: false,
    metaData: {},
  };

  const convoFormService = new ConversationServiceV5(sampleConversation);

  if (sampleConversation.formFieldResponses[1]) {
    const resultStream = await convoFormService.process(
      "utkarsh anand",
      sampleConversation.formFieldResponses[1],
    );

    return createUIMessageStreamResponse({
      stream: resultStream,
    });
  }

  return NextResponse.json({
    success: true,
    result: sampleConversation,
    timestamp: new Date().toISOString(),
  });
}
