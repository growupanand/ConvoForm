#!/usr/bin/env bun
import type { Conversation } from "@convoform/db/src/schema";
import { ConversationService } from "../conversationV5/core/conversationService";

// Helper function to create conversation logger
function createConversationLogger(logger: TestLogger) {
  return async (updatedConversation: Conversation) => {
    // Display the complete conversation transcript
    logger.info("💬 CONVERSATION TRANSCRIPT:");
    logger.info("─".repeat(50));
    updatedConversation.transcript.forEach((message, index) => {
      const roleIcon = message.role === "user" ? "👤" : "🤖";
      const roleLabel = message.role === "user" ? "USER" : "AI";
      logger.info(
        `${index + 1}. ${roleIcon} ${roleLabel}: "${message.content}"`,
      );
    });
    logger.info("─".repeat(50));

    // Log collected data updates in one line
    const filledFields = updatedConversation.collectedData.filter(
      (field) => field.fieldValue !== null,
    );
    const fieldSummary = filledFields
      .map((f) => `${f.fieldName}:"${f.fieldValue}"`)
      .join(", ");
    logger.info(
      `📊 Fields (${filledFields.length}/${updatedConversation.collectedData.length}): ${fieldSummary}`,
    );
    logger.info(""); // Add spacing
  };
}

// Mock data for testing
// const mockForm = {
//     id: "test-form-123",
//     name: "Test Registration Form",
//     overview: "A comprehensive test form with multiple field types",
//     welcomeScreenTitle: "Welcome to Test Form",
//     welcomeScreenMessage: "Please fill out this form completely",
//     welcomeScreenCTALabel: "Start Form",
//     isPublished: true,
//     publishedAt: new Date(),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     organizationId: "test-org-123",
//     workspaceId: "test-workspace-123",
//     userId: "test-user-123",
//     showOrganizationName: false,
//     showOrganizationLogo: false,
//     isAIGenerated: false,
//     formOverview: "Test form for conversation flow validation"
// };

const mockConversation: Conversation = {
  id: "test-conversation-123",
  name: "Test Conversation",
  formId: "test-form-123",
  organizationId: "test-org-123",
  isInProgress: true,
  transcript: [
    {
      role: "assistant",
      content: "Welcome! Let's start with your basic information.",
    },
  ],
  collectedData: [
    {
      id: "field-1",
      fieldName: "Full Name",
      fieldDescription: "Please provide your full name",
      fieldConfiguration: {
        inputType: "text" as const,
        inputConfiguration: {
          placeholder: "Enter your full name",
          maxLength: 100,
        },
      },
      fieldValue: null,
    },
    {
      id: "field-2",
      fieldName: "Email Address",
      fieldDescription: "Please provide your email address",
      fieldConfiguration: {
        inputType: "text" as const,
        inputConfiguration: {
          placeholder: "Enter your email",
          maxLength: 255,
        },
      },
      fieldValue: null,
    },
    {
      id: "field-3",
      fieldName: "Age Range",
      fieldDescription: "Please select your age range",
      fieldConfiguration: {
        inputType: "multipleChoice" as const,
        inputConfiguration: {
          options: [
            { value: "18-25" },
            { value: "26-35" },
            { value: "36-45" },
            { value: "46+" },
          ],
          allowMultiple: false,
        },
      },
      fieldValue: null,
    },
    {
      id: "field-4",
      fieldName: "Experience Rating",
      fieldDescription: "Rate your overall experience",
      fieldConfiguration: {
        inputType: "rating" as const,
        inputConfiguration: {
          maxRating: 5,
          lowLabel: "Poor",
          highLabel: "Excellent",
          iconType: "STAR",
          requireConfirmation: false,
        },
      },
      fieldValue: null,
    },
  ],
  formOverview: "Test form for conversation flow validation",
  createdAt: new Date(),
  updatedAt: new Date(),
  finishedAt: null,
  metaData: {},
};

// Test utilities
class TestLogger {
  private testCount = 0;
  private passedTests = 0;
  public failedTests = 0;

  startTest(testName: string) {
    this.testCount++;
    console.log(`\n🧪 Test ${this.testCount}: ${testName}`);
    console.log("─".repeat(50));
  }

  pass(message: string) {
    this.passedTests++;
    console.log(`✅ PASS: ${message}`);
  }

  fail(message: string, error?: any) {
    this.failedTests++;
    console.log(`❌ FAIL: ${message}`);
    if (error) {
      console.log(`   Error: ${error.message || error}`);
    }
  }

  info(message: string) {
    console.log(`ℹ️  INFO: ${message}`);
  }

  summary() {
    console.log(`\n${"=".repeat(60)}`);
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${this.testCount}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.failedTests}`);
    console.log(
      `Success Rate: ${((this.passedTests / this.testCount) * 100).toFixed(1)}%`,
    );

    if (this.failedTests === 0) {
      console.log("\n🎉 All tests passed!");
    } else {
      console.log(`\n⚠️  ${this.failedTests} test(s) failed`);
    }
  }
}

// Mock stream writer for testing
class MockStreamWriter {
  private messages: any[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];

  write(message: any) {
    this.messages.push(message);

    // Enhanced stream logging with better formatting
    if (message.type === "text-start") {
      console.log(`   📤 Stream START: ${message.id}`);
      console.log("   🤖 AI is generating response...");
    } else if (message.type === "text-delta") {
      console.log(`   📝 Stream DELTA: "${message.delta}"`);
    } else if (message.type === "text-end") {
      console.log(`   ✅ Stream END: ${message.id}`);
      console.log("   🏁 AI response completed");
    } else {
      console.log(`   📤 Stream: ${JSON.stringify(message, null, 2)}`);
    }
  }

  merge(_stream: ReadableStream<any>) {
    // Merge messages from a readable stream
    // For testing purposes, we'll just log that merge was called
    console.log("   🔀 Stream merge called");
  }

  onError(error: unknown) {
    // Handle error - for testing purposes, we'll log it
    console.error("   ❌ Stream error:", error);
    // Trigger any registered error handlers
    if (error instanceof Error) {
      this.errorHandlers.forEach((handler) => handler(error));
    }
  }

  // Helper method to trigger error handlers (for testing)
  triggerError(error: Error) {
    this.errorHandlers.forEach((handler) => handler(error));
  }

  getMessages() {
    return this.messages;
  }

  clear() {
    this.messages = [];
    this.errorHandlers = [];
  }
}

// Test functions
async function testValidAnswerFlow(logger: TestLogger) {
  logger.startTest("Valid Answer Flow - Text Field");

  try {
    const conversation = JSON.parse(JSON.stringify(mockConversation));
    const mockWriter = new MockStreamWriter();

    // Use the reusable conversation logger
    const onUpdateConversation = createConversationLogger(logger);

    const service = new ConversationService(conversation, {
      onUpdateConversation,
      streamWriter: mockWriter,
    });

    const currentField = conversation.collectedData[0]; // Full Name field
    const validAnswer = "John Doe";

    logger.info(
      `🎧 Testing: ${currentField.fieldName} | Answer: "${validAnswer}" | Initial: ${conversation.transcript.length} msgs, ${conversation.collectedData.filter((field: any) => field.fieldValue !== null).length} fields`,
    );

    const result = await service.orchestrateConversation(
      validAnswer,
      currentField,
    );

    const streamMessages = mockWriter.getMessages();
    logger.info(
      `📺 Stream: ${streamMessages.length} messages | Result: ${result ? "Success" : "Failed"}`,
    );

    if (result) {
      logger.pass("Conversation orchestration completed successfully");
      logger.pass("Stream result returned");
    } else {
      logger.fail("No stream result returned");
    }
  } catch (error) {
    logger.fail("Valid answer flow failed", error);
  }
}

async function testInvalidAnswerFlow(logger: TestLogger) {
  logger.startTest("Invalid Answer Flow - Empty Input");

  try {
    const conversation = JSON.parse(JSON.stringify(mockConversation));
    const service = new ConversationService(conversation, {
      onUpdateConversation: createConversationLogger(logger),
    });

    const currentField = conversation.collectedData[0];
    const invalidAnswer = "   "; // Empty/whitespace answer

    logger.info(
      `🎧 Testing: ${currentField.fieldName} | Invalid Answer: "${invalidAnswer}"`,
    );

    try {
      await service.orchestrateConversation(invalidAnswer, currentField);
      logger.fail("Should have thrown error for empty answer");
    } catch (error) {
      if ((error as Error).message.includes("Answer cannot be empty")) {
        logger.pass("Correctly rejected empty answer");
      } else {
        logger.fail("Unexpected error for empty answer", error);
      }
    }
  } catch (error) {
    logger.fail("Invalid answer flow test failed", error);
  }
}

async function testMultipleChoiceField(logger: TestLogger) {
  logger.startTest("Multiple Choice Field Processing");

  try {
    const conversation = JSON.parse(JSON.stringify(mockConversation));
    // Set first field as completed to test second field
    conversation.collectedData[0].fieldValue = "John Doe";

    const service = new ConversationService(conversation, {
      onUpdateConversation: createConversationLogger(logger),
    });
    const currentField = conversation.collectedData[2]; // Age Range field
    const validChoice = "26-35";

    const options = currentField.fieldConfiguration.inputConfiguration.options
      .map((o: { value: any }) => o.value)
      .join(", ");
    logger.info(
      `🎧 Testing: ${currentField.fieldName} (${currentField.fieldConfiguration.inputType}) | Options: ${options} | Choice: "${validChoice}"`,
    );

    const result = await service.orchestrateConversation(
      validChoice,
      currentField,
    );
    logger.info(`📺 Result: ${result ? "Success" : "Failed"}`);

    if (result) {
      logger.pass("Multiple choice field processed successfully");
    } else {
      logger.fail("Multiple choice field processing failed");
    }
  } catch (error) {
    logger.fail("Multiple choice field test failed", error);
  }
}

async function testRatingField(logger: TestLogger) {
  logger.startTest("Rating Field Processing");

  try {
    const conversation = JSON.parse(JSON.stringify(mockConversation));
    // Set previous fields as completed
    conversation.collectedData[0].fieldValue = "John Doe";
    conversation.collectedData[1].fieldValue = "john@example.com";
    conversation.collectedData[2].fieldValue = "26-35";

    const service = new ConversationService(conversation, {
      onUpdateConversation: createConversationLogger(logger),
    });
    const currentField = conversation.collectedData[3]; // Rating field
    const validRating = "4";

    logger.info(
      `🎧 Testing: ${currentField.fieldName} (${currentField.fieldConfiguration.inputType}) | Max: ${currentField.fieldConfiguration.inputConfiguration.maxRating} | Rating: "${validRating}"`,
    );

    const result = await service.orchestrateConversation(
      validRating,
      currentField,
    );
    logger.info(`📺 Result: ${result ? "Success" : "Failed"}`);

    if (result) {
      logger.pass("Rating field processed successfully");
    } else {
      logger.fail("Rating field processing failed");
    }
  } catch (error) {
    logger.fail("Rating field test failed", error);
  }
}

async function testConversationCompletion(logger: TestLogger) {
  logger.startTest("Conversation Completion Flow");

  try {
    const conversation = JSON.parse(JSON.stringify(mockConversation));
    // Set all fields as completed except the last one
    conversation.collectedData[0].fieldValue = "John Doe";
    conversation.collectedData[1].fieldValue = "john@example.com";
    conversation.collectedData[2].fieldValue = "26-35";

    const service = new ConversationService(conversation, {
      onUpdateConversation: createConversationLogger(logger),
    });
    const lastField = conversation.collectedData[3]; // Rating field (last field)
    const finalAnswer = "5";

    logger.info(
      `🎧 Testing completion: ${lastField.fieldName} | Final Answer: "${finalAnswer}"`,
    );

    const result = await service.orchestrateConversation(
      finalAnswer,
      lastField,
    );
    logger.info(
      `📺 Result: ${result ? "Success - End message stream" : "Failed"}`,
    );

    if (result) {
      logger.pass("Conversation completion flow executed");
    } else {
      logger.fail("Conversation completion failed");
    }
  } catch (error) {
    logger.fail("Conversation completion test failed", error);
  }
}

async function testConversationValidation(logger: TestLogger) {
  logger.startTest("Conversation Schema Validation");

  try {
    // Test conversation structure
    const conversation = mockConversation;

    logger.info("Validating conversation structure...");

    // Basic structure checks
    if (conversation.id && typeof conversation.id === "string") {
      logger.pass("Conversation ID is valid");
    } else {
      logger.fail("Invalid conversation ID");
    }

    if (
      Array.isArray(conversation.collectedData) &&
      conversation.collectedData.length > 0
    ) {
      logger.pass(
        `Collected data array has ${conversation.collectedData.length} fields`,
      );
    } else {
      logger.fail("Invalid collected data structure");
    }

    if (Array.isArray(conversation.transcript)) {
      logger.pass(
        `Transcript array has ${conversation.transcript.length} messages`,
      );
    } else {
      logger.fail("Invalid transcript structure");
    }

    // Field validation
    for (const field of conversation.collectedData) {
      if (
        field.id &&
        field.fieldName &&
        field.fieldDescription &&
        field.fieldConfiguration
      ) {
        logger.pass(`Field "${field.fieldName}" structure is valid`);
      } else {
        logger.fail(
          `Field "${field.fieldName || "unknown"}" has invalid structure`,
        );
      }
    }
  } catch (error) {
    logger.fail("Conversation validation failed", error);
  }
}

// Main test runner
async function runAllTests() {
  const logger = new TestLogger();

  console.log("🚀 Starting ConvoForm Conversation Flow Tests");
  console.log("=".repeat(60));

  // Run all tests
  await testConversationValidation(logger);
  await testValidAnswerFlow(logger);
  await testInvalidAnswerFlow(logger);
  await testMultipleChoiceField(logger);
  await testRatingField(logger);
  await testConversationCompletion(logger);

  // Print summary
  logger.summary();

  // Exit with appropriate code
  process.exit(logger.failedTests > 0 ? 1 : 0);
}

// Handle both bun and node execution
if (import.meta.main || require.main === module) {
  runAllTests().catch((error) => {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  });
}
