/**
 * LLM Analytics Playground
 * Test PostHog LLM analytics integration with all AI actions
 */

import { exit } from "node:process";
import { type LLMAnalyticsMetadata, llmActionType } from "@convoform/analytics";
import { generateObject, generateText } from "ai";
import { z } from "zod/v4";
import { getTracedModelConfig } from "../config";
import {
  type ConversationAIMetadata,
  type FormGenerationAIMetadata,
  createConversationTracedModel,
  createFormGenerationTracedModel,
  withLLMAnalytics,
} from "../utils/llmAnalytics";

/**
 * Test Environment Variables
 * Add these to your .env file for testing:
 * NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
 * NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
 * OPENAI_API_KEY=your_openai_key
 */

console.log("🚀 LLM Analytics Playground");
console.log("Environment Variables Check:");
console.log(
  "- POSTHOG_KEY:",
  process.env.NEXT_PUBLIC_POSTHOG_KEY ? "✅ Set" : "❌ Missing",
);
console.log(
  "- POSTHOG_HOST:",
  process.env.NEXT_PUBLIC_POSTHOG_HOST ? "✅ Set" : "❌ Missing",
);
console.log(
  "- OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "✅ Set" : "❌ Missing",
);

/**
 * Test 1: Basic LLM Analytics with Simple Text Generation
 */
async function testBasicAnalytics() {
  console.log("\n📊 Test 1: Basic LLM Analytics");

  const metadata: ConversationAIMetadata = {
    userId: "test-user-123",
    formId: "test-form-456",
    conversationId: "test-conversation-789",
    organizationId: "test-org-001",
    actionType: "test_basic_generation" as any,
    isAnonymous: false,
  };

  const tracedModel = getTracedModelConfig(metadata);

  try {
    const result = await generateText({
      model: tracedModel,
      prompt: "Say hello and explain what you do in one sentence.",
      temperature: 0.1,
    });

    console.log("✅ Basic analytics test successful");
    console.log("Response:", result.text);
    console.log("Usage:", result.usage);

    return result;
  } catch (error) {
    console.error("❌ Basic analytics test failed:", error);
    throw error;
  }
}

/**
 * Test 2: Conversation-Specific Analytics
 */
async function testConversationAnalytics() {
  console.log("\n💬 Test 2: Conversation Analytics");

  const conversationMetadata: ConversationAIMetadata = {
    userId: "user-456",
    formId: "form-123",
    conversationId: "conv-789",
    organizationId: "org-001",
    actionType: llmActionType.enum.generateFieldQuestion,
    fieldType: "text",
  };

  const tracedModel = createConversationTracedModel(conversationMetadata);

  try {
    const result = await withLLMAnalytics(
      llmActionType.enum.generateFieldQuestion,
      async () => {
        return await generateText({
          model: tracedModel,
          prompt:
            "Generate a friendly question asking for the user's name for a contact form.",
          temperature: 0.3,
        });
      },
    );

    console.log("✅ Conversation analytics test successful");
    console.log("Generated question:", result.text);

    return result;
  } catch (error) {
    console.error("❌ Conversation analytics test failed:", error);
    throw error;
  }
}

/**
 * Test 3: Form Generation Analytics
 */
async function testFormGenerationAnalytics() {
  console.log("\n📝 Test 3: Form Generation Analytics");

  const formMetadata: FormGenerationAIMetadata = {
    userId: "user-789",
    organizationId: "org-002",
    actionType: llmActionType.enum.generateFormFields,
    templateType: "contact_form",
  };

  const tracedModel = createFormGenerationTracedModel(formMetadata);

  const schema = z.object({
    fields: z.array(
      z.object({
        name: z.string(),
        type: z.enum(["text", "email", "phone"]),
        label: z.string(),
        required: z.boolean().optional().default(true), // Make optional with default
      }),
    ),
  });

  try {
    const result = await withLLMAnalytics(
      llmActionType.enum.generateFormFields,
      async () => {
        return await generateObject({
          model: tracedModel,
          prompt:
            "Generate 3 fields for a basic contact form: name, email, and phone number. Each field should have name, type, label, and required properties. Make all fields required: true.",
          schema,
          temperature: 0.2,
        });
      },
    );

    console.log("✅ Form generation analytics test successful");
    console.log("Generated fields:", JSON.stringify(result.object, null, 2));

    return result;
  } catch (error) {
    console.error("❌ Form generation analytics test failed:", error);
    throw error;
  }
}

/**
 * Test 4: Anonymous User Analytics
 */
async function testAnonymousAnalytics() {
  console.log("\n👤 Test 4: Anonymous User Analytics");

  const anonymousMetadata: LLMAnalyticsMetadata = {
    // No userId provided (anonymous)
    formId: "anonymous-form-123",
    conversationId: "anonymous-conv-456",
    organizationId: "org-anonymous",
    actionType: "anonymous_interaction" as any,
    isAnonymous: true,
  };

  const tracedModel = getTracedModelConfig(anonymousMetadata);

  try {
    const result = await generateText({
      model: tracedModel,
      prompt:
        "Generate a welcome message for an anonymous user filling out a form.",
      temperature: 0.4,
    });

    console.log("✅ Anonymous analytics test successful");
    console.log("Welcome message:", result.text);

    return result;
  } catch (error) {
    console.error("❌ Anonymous analytics test failed:", error);
    throw error;
  }
}

/**
 * Main playground runner
 */
async function runPlayground() {
  console.log("\n🎮 Starting LLM Analytics Playground...\n");

  const tests = [
    { name: "Basic Analytics", test: testBasicAnalytics },
    { name: "Conversation Analytics", test: testConversationAnalytics },
    { name: "Form Generation Analytics", test: testFormGenerationAnalytics },
    { name: "Anonymous Analytics", test: testAnonymousAnalytics },
  ];

  const results = [];

  for (const { name, test } of tests) {
    try {
      console.log(`\n⚡ Running ${name}...`);
      const result = await test();
      results.push({ name, status: "success", result });
      console.log(`✅ ${name} completed`);
    } catch (error) {
      results.push({ name, status: "failed", error });
      console.log(`❌ ${name} failed`);
    }

    // Wait between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log("\n📊 Playground Summary:");
  console.log("=".repeat(50));

  results.forEach(({ name, status }) => {
    const emoji = status === "success" ? "✅" : "❌";
    console.log(`${emoji} ${name}: ${status}`);
  });

  const successCount = results.filter((r) => r.status === "success").length;
  console.log(`\n🎯 ${successCount}/${results.length} tests passed`);

  if (successCount === results.length) {
    console.log("\n🎉 All tests passed! LLM Analytics is working correctly.");
    console.log("\n📋 Next Steps:");
    console.log("1. Check your PostHog dashboard for $ai_generation events");
    console.log("2. Verify the custom properties are being captured");
    console.log("3. Test with different field types and scenarios");
    console.log("4. Integrate analytics into your production AI actions");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Check the errors above and your configuration.",
    );
  }

  return results;
}

// Export for manual testing
export {
  runPlayground,
  testBasicAnalytics,
  testConversationAnalytics,
  testFormGenerationAnalytics,
  testAnonymousAnalytics,
};

// Auto-run if this file is executed directly
if (require.main === module) {
  runPlayground()
    .catch(console.error)
    .finally(() => exit());
}
