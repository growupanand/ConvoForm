import { CoreService, type CoreServiceUIMessage } from "@convoform/ai";
import type {
  CollectedData,
  Form,
  Transcript,
} from "@convoform/db/src/schema";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { NextRequest } from "next/server";

// Sample form data
const sampleForm: Form = {
  id: "form-123",
  name: "Customer Feedback Form",
  overview:
    "A comprehensive customer feedback form to collect user experience data",
  welcomeScreenTitle: "Welcome to our feedback form",
  welcomeScreenMessage:
    "We value your opinion and would love to hear about your experience with our service.",
  welcomeScreenCTALabel: "Start Survey",
  isPublished: true,
  publishedAt: new Date("2024-01-15T09:00:00Z"),
  createdAt: new Date("2024-01-15T09:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z"),
  organizationId: "org-123",
  showOrganizationName: false,
  showOrganizationLogo: false,
  isAIGenerated: false,
  userId: "user-id-1",
  organizationName: "Organization Name",
  organizationLogoUrl: "https://example.com/logo.png",
  showCustomEndScreenMessage: false,
  customEndScreenMessage: "",
  formFieldsOrders: ["field-1", "field-2", "field-3", "field-4"],
  endScreenCTAUrl: "https://example.com/submit",
  endScreenCTALabel: "Submit",
  googleFormId: "google-form-id-1",
};

// Sample form fields
const sampleCollectedData: CollectedData[] = [
  {
    id: "field-1",
    fieldName: "name",
    fieldDescription: "Customer's full name",
    fieldConfiguration: {
      inputType: "text" as const,
      inputConfiguration: {
        placeholder: "Enter your full name",
      },
    },
    fieldValue: null,
  },
  {
    id: "field-2",
    fieldName: "email",
    fieldDescription: "Customer's email address",
    fieldConfiguration: {
      inputType: "text" as const,
      inputConfiguration: {
        placeholder: "Enter your email address",
      },
    },
    fieldValue: null,
  },
  {
    id: "field-3",
    fieldName: "rating",
    fieldDescription: "Overall satisfaction rating",
    fieldConfiguration: {
      inputType: "multipleChoice" as const,
      inputConfiguration: {
        options: [
          { value: "excellent", isOther: false },
          { value: "good", isOther: false },
          { value: "average", isOther: false },
          { value: "poor", isOther: false },
        ],
        allowMultiple: false,
      },
    },
    fieldValue: null,
  },
  {
    id: "field-4",
    fieldName: "feedback",
    fieldDescription: "Additional comments or suggestions",
    fieldConfiguration: {
      inputType: "text" as const,
      inputConfiguration: {
        placeholder: "Share your thoughts...",
        isParagraph: true,
        maxLength: 500,
      },
    },
    fieldValue: null,
  },
];

// Sample conversation data for testing
const sampleConversation = {
  id: "conv-123",
  name: "Customer Feedback Session",
  formId: "form-123",
  organizationId: "org-123",
  formOverview:
    "A sample customer feedback form to collect user experience data",
  isInProgress: true,
  finishedAt: null,
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z"),
  metaData: {},
  transcript: [
    {
      role: "assistant",
      content:
        "Hello! I'd like to get your feedback about our service. What's your name?",
      fieldName: "name",
    },
  ] as Transcript[],
  collectedData: sampleCollectedData,
  form: sampleForm,
};

export async function GET(_request: NextRequest) {
  const stream = createUIMessageStream<CoreServiceUIMessage>({
    execute: async ({ writer }) => {
      writer.write({ type: "text-start", id: "stream-start" });
      console.log("🚀 Starting conversation playground with mock answer...");

      // Initialize CoreService with sample conversation
      const coreService = new CoreService({
        conversation: sampleConversation,
        onUpdateConversation: async (updatedConversation) => {
          console.log("📝 Conversation updated:", {
            id: updatedConversation.id,
            isInProgress: updatedConversation.isInProgress,
            collectedDataCount: updatedConversation.collectedData.filter(
              (field) => field.fieldValue,
            ).length,
            transcriptLength: updatedConversation.transcript?.length || 0,
          });
          writer.write({ type: "data-conversation", data: updatedConversation });
        },
      });

      // Mock conversation flow: Submit answer for the first field (name)
      const currentField = sampleConversation.collectedData[0];
      const mockAnswer = "My name is John Doe";

      if (!currentField) {
        throw new Error("No field available for testing");
      }

      console.log(
        `📝 Submitting mock answer: "${mockAnswer}" for field: ${currentField.fieldName}`,
      );

      // Get the actual stream response from CoreService
      const coreStream = await coreService.process(mockAnswer, currentField);
      console.log("✅ Stream response created successfully");
      writer.merge(coreStream);


    }

  });

  // Return the stream response using createUIMessageStreamResponse
  return createUIMessageStreamResponse({
    stream,
  });

}
