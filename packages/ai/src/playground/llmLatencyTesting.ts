/**
 * LLM Latency Testing Playground
 * Simulates a complete form conversation flow and measures latency for different AI models
 *
 * Usage:
 * bun run packages/ai/src/playground/llmLatencyTesting.ts
 */

import { exit } from "node:process";
import { openai } from "@ai-sdk/openai";
import type { FormFieldResponses } from "@convoform/db/src/schema";
import type { LanguageModel } from "ai";
import { extractFieldAnswer } from "../ai-actions/extractFieldAnswer";
import { generateConversationName } from "../ai-actions/generateConversationName";
import { generateEndMessage } from "../ai-actions/generateEndMessage";
import {
  type StreamFieldQuestionParams,
  streamFieldQuestion,
} from "../ai-actions/streamFieldQuestion";

// ============================================================================
// Types & Configuration
// ============================================================================

interface LatencyRecord {
  actionType: string;
  durationMs: number;
  timestamp: Date;
  modelName: string;
  success: boolean;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost?: number;
  context?: string;
}

interface ModelTestResult {
  modelName: string;
  totalDurationMs: number;
  records: LatencyRecord[];
  success: boolean;
  error?: string;
}

interface TestConfig {
  models: Array<{ name: string; model: Exclude<LanguageModel, string> }>;
}

// ============================================================================
// Mock Form Data - A Job Application Form
// ============================================================================

const MOCK_FORM_OVERVIEW =
  "A comprehensive job application form for software engineering positions at a tech startup";

const MOCK_FIELDS: FormFieldResponses[] = [
  {
    id: "field-1",
    fieldName: "fullName",
    fieldDescription: "Your full legal name",
    fieldValue: null,
    fieldConfiguration: {
      inputType: "text" as const,
      inputConfiguration: {},
    },
  },
  {
    id: "field-2",
    fieldName: "experienceLevel",
    fieldDescription:
      "Your years of professional software development experience",
    fieldValue: null,
    fieldConfiguration: {
      inputType: "multipleChoice" as const,
      inputConfiguration: {
        options: [
          { value: "0-1 years" },
          { value: "1-3 years" },
          { value: "3-5 years" },
          { value: "5-10 years" },
          { value: "10+ years" },
        ],
      },
    },
  },
  {
    id: "field-3",
    fieldName: "technicalSkills",
    fieldDescription: "Your primary programming languages and technologies",
    fieldValue: null,
    fieldConfiguration: {
      inputType: "text" as const,
      inputConfiguration: {
        placeholder: "e.g., JavaScript, Python, React, Node.js",
      },
    },
  },
  {
    id: "field-4",
    fieldName: "availability",
    fieldDescription: "When can you start?",
    fieldValue: null,
    fieldConfiguration: {
      inputType: "datePicker" as const,
      inputConfiguration: {},
    },
  },
];

// Simulated user responses for consistent testing
const USER_RESPONSES = [
  "Hi! My name is Sarah Johnson",
  "I have about 5 years of professional experience in software development",
  "I'm proficient in TypeScript, React, Node.js, PostgreSQL, and AWS cloud services",
  "I can start in about 2 weeks, so around the first week of next month",
];

// ============================================================================
// Cost Calculation Utilities
// ============================================================================

// Pricing per 1M tokens (USD) - as of 2025
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4.1-nano": { input: 0.1, output: 0.4 },
  "claude-3-5-haiku-20241022": { input: 0.25, output: 1.25 },
  "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
};

/**
 * Calculate cost in USD based on token usage and model
 */
function calculateCost(
  modelName: string,
  usage: { promptTokens: number; completionTokens: number },
): number {
  // Extract base model name from full model name
  const baseModel = modelName
    .toLowerCase()
    .replace(/^(gpt-|claude-|gemini-)/, "");

  // Find matching pricing
  let pricing = MODEL_PRICING[baseModel];
  if (!pricing) {
    // Try to find partial match
    const matchingKey = Object.keys(MODEL_PRICING).find(
      (key) => baseModel.includes(key) || key.includes(baseModel),
    );
    pricing = matchingKey
      ? MODEL_PRICING[matchingKey]
      : { input: 0, output: 0 };
  }

  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Format cost in a readable way
 */
function formatCost(cost: number): string {
  if (cost < 0.001) {
    return `$${(cost * 1000).toFixed(10)}m`; // Show in millicents
  }
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(10)}¢`; // Show in cents
  }
  return `$${cost.toFixed(10)}`;
}

// ============================================================================
// Latency Measurement Utilities
// ============================================================================

/**
 * Measures execution time of an async function with usage and cost tracking
 */
async function measureLatency<T>(
  actionType: string,
  modelName: string,
  fn: () => Promise<T>,
  contextFn?: (result: T) => string,
): Promise<{ result: T; record: LatencyRecord }> {
  const startTime = Date.now();
  let success = false;
  let error: string | undefined;
  let result: T;
  let usage:
    | { promptTokens: number; completionTokens: number; totalTokens: number }
    | undefined;
  let cost: number | undefined;
  let context: string | undefined;

  try {
    result = await fn();
    success = true;

    // Extract usage information from AI SDK response
    const response = result as any;
    if (response?.usage) {
      usage = {
        promptTokens: response.usage.promptTokens || 0,
        completionTokens: response.usage.completionTokens || 0,
        totalTokens: response.usage.totalTokens || 0,
      };
      cost = calculateCost(modelName, usage);
    }

    // Generate context from result if contextFn provided
    if (contextFn) {
      context = contextFn(result);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    const durationMs = Date.now() - startTime;

    // Log individual action with details
    const statusEmoji = success ? "✅" : "❌";
    const usageStr = usage ? ` | ${usage.totalTokens} tokens` : "";
    const costStr = cost ? ` | ${formatCost(cost)}` : "";
    const contextStr = context ? ` | ${context}` : "";
    console.log(
      `  ${statusEmoji} ${actionType}: ${durationMs}ms${usageStr}${costStr}${contextStr}`,
    );
  }

  return {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    result: result!,
    record: {
      actionType,
      durationMs: Date.now() - startTime,
      timestamp: new Date(),
      modelName,
      success,
      error,
      usage,
      cost,
      context,
    },
  };
}

// ============================================================================
// Conversation Simulation
// ============================================================================

/**
 * Simulates a complete form conversation flow and measures latency
 */
async function simulateConversation(
  modelName: string,
  model: Exclude<LanguageModel, string>,
): Promise<ModelTestResult> {
  console.log(`\n🎯 Testing model: ${modelName}`);
  console.log("─".repeat(60));

  const records: LatencyRecord[] = [];
  const formFieldResponses: FormFieldResponses[] = [];
  const transcript: Array<{ role: "user" | "assistant"; content: string }> = [];

  try {
    // Step 1: Generate initial question
    const { result: firstQuestionResult, record: r1 } = await measureLatency(
      "streamFieldQuestion (first)",
      modelName,
      async () => {
        const params: StreamFieldQuestionParams = {
          formOverview: MOCK_FORM_OVERVIEW,
          currentField: MOCK_FIELDS[0],
          formFieldResponses: [],
          transcript: [],
          isFirstQuestion: true,
          model,
        };

        const result = streamFieldQuestion(params);
        let fullText = "";
        for await (const chunk of result.textStream) {
          fullText += chunk;
        }
        return { text: fullText, usage: result.usage };
      },
      (result) =>
        `Q: "${result.text.slice(0, 80)}${result.text.length > 80 ? "..." : ""}"`,
    );
    records.push(r1);
    transcript.push({ role: "assistant", content: firstQuestionResult.text });

    // Simulate conversation for each field
    for (let i = 0; i < MOCK_FIELDS.length; i++) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const field = MOCK_FIELDS[i]!;
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const userResponse = USER_RESPONSES[i]!;
      console.log("user response: ", userResponse);

      // Add user response to transcript
      transcript.push({ role: "user", content: userResponse });

      // Step 2: Extract answer from user response
      const { result: extractedAnswer, record: r2 } = await measureLatency(
        `extractFieldAnswer (field ${i + 1})`,
        modelName,
        async () => {
          return await extractFieldAnswer({
            formOverview: MOCK_FORM_OVERVIEW,
            currentField: field,
            transcript,
            model,
          });
        },
        (result) =>
          `Valid: ${result.object.isValid ? "✓" : "✗"} | Answer: "${(result.object.answer || "null").slice(0, 40)}${(result.object.answer || "").length > 40 ? "..." : ""}"`,
      );
      records.push(r2);

      // Update field value with extracted answer
      const updatedField: FormFieldResponses = {
        ...field,
        fieldValue: extractedAnswer.object.answer || userResponse,
      };
      formFieldResponses.push(updatedField);

      // Step 3: Generate next question (if not last field)
      if (i < MOCK_FIELDS.length - 1) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const nextField = MOCK_FIELDS[i + 1]!;

        const { result: nextQuestionResult, record: r3 } = await measureLatency(
          `streamFieldQuestion (field ${i + 2})`,
          modelName,
          async () => {
            const params: StreamFieldQuestionParams = {
              formOverview: MOCK_FORM_OVERVIEW,
              currentField: nextField,
              formFieldResponses,
              transcript,
              isFirstQuestion: false,
              model,
            };

            const result = streamFieldQuestion(params);
            let fullText = "";
            for await (const chunk of result.textStream) {
              fullText += chunk;
            }
            return { text: fullText, usage: result.usage };
          },
          (result) =>
            `Q: "${result.text.slice(0, 80)}${result.text.length > 80 ? "..." : ""}"`,
        );
        records.push(r3);
        transcript.push({
          role: "assistant",
          content: nextQuestionResult.text,
        });
      }
    }

    // Step 4: Generate end message
    const { record: r4 } = await measureLatency(
      "generateEndMessage",
      modelName,
      async () => {
        return await generateEndMessage({
          formOverview: MOCK_FORM_OVERVIEW,
          formFieldResponses,
          transcript,
          model,
        });
      },
      (result) =>
        `Title: "${result.object.title.slice(0, 50)}${result.object.title.length > 50 ? "..." : ""}"`,
    );
    records.push(r4);

    // Step 5: Generate conversation name
    const { record: r5 } = await measureLatency(
      "generateConversationName",
      modelName,
      async () => {
        return await generateConversationName({
          formOverview: MOCK_FORM_OVERVIEW,
          formFieldResponses,
          transcript,
          model,
        });
      },
      (result) => `Name: "${result.object.name}"`,
    );
    records.push(r5);

    const totalDurationMs = records.reduce((sum, r) => sum + r.durationMs, 0);

    console.log(`\n✅ Completed in ${totalDurationMs}ms`);

    return {
      modelName,
      totalDurationMs,
      records,
      success: true,
    };
  } catch (error) {
    console.error(
      `\n❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    const totalDurationMs = records.reduce((sum, r) => sum + r.durationMs, 0);

    return {
      modelName,
      totalDurationMs,
      records,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Results Analysis & Display
// ============================================================================

/**
 * Displays comprehensive test results with analysis
 */
function displayResults(results: ModelTestResult[]) {
  console.log("\n\n");
  console.log("═".repeat(80));
  console.log("📊 LLM LATENCY TEST RESULTS");
  console.log("═".repeat(80));

  // Overall summary
  console.log("\n📈 Overall Summary:");
  console.log("─".repeat(80));

  const successfulTests = results.filter((r) => r.success);
  const failedTests = results.filter((r) => !r.success);

  console.log(`Total Models Tested: ${results.length}`);
  console.log(`✅ Successful: ${successfulTests.length}`);
  console.log(`❌ Failed: ${failedTests.length}`);

  if (successfulTests.length === 0) {
    console.log("\n⚠️  No successful tests to analyze.");
    return;
  }

  // Model comparison table
  console.log("\n🏆 Model Performance Comparison (Successful Tests Only):");
  console.log("─".repeat(80));

  const sortedResults = [...successfulTests].sort(
    (a, b) => a.totalDurationMs - b.totalDurationMs,
  );

  console.log(
    "Rank | Model Name             | Time     | Tokens  | Cost      | Avg/Call",
  );
  console.log(
    "─────┼────────────────────────┼──────────┼─────────┼───────────┼──────────",
  );

  sortedResults.forEach((result, index) => {
    const avgLatency = Math.round(
      result.totalDurationMs / result.records.length,
    );
    const totalTokens = result.records.reduce(
      (sum, r) => sum + (r.usage?.totalTokens || 0),
      0,
    );
    const totalCost = result.records.reduce((sum, r) => sum + (r.cost || 0), 0);

    const rank =
      index === 0
        ? "🥇"
        : index === 1
          ? "🥈"
          : index === 2
            ? "🥉"
            : `${index + 1}. `;
    const modelNamePadded = result.modelName.padEnd(22);
    const totalTime = `${result.totalDurationMs}ms`.padEnd(8);
    const tokensStr = totalTokens.toLocaleString().padEnd(7);
    const costStr = formatCost(totalCost).padEnd(9);
    const avgTime = `${avgLatency}ms`;

    console.log(
      `${rank} | ${modelNamePadded} | ${totalTime} | ${tokensStr} | ${costStr} | ${avgTime}`,
    );
  });

  // Detailed breakdown by action type
  console.log("\n📋 Breakdown by Action Type:");
  console.log("─".repeat(80));

  const actionTypes = Array.from(
    new Set(
      successfulTests.flatMap((r) => r.records.map((rec) => rec.actionType)),
    ),
  );

  actionTypes.forEach((actionType) => {
    console.log(`\n${actionType}:`);

    const actionRecords = successfulTests
      .map((result) => {
        const relevantRecords = result.records.filter(
          (r) => r.actionType === actionType,
        );
        const avgDuration =
          relevantRecords.length > 0
            ? Math.round(
              relevantRecords.reduce((sum, r) => sum + r.durationMs, 0) /
              relevantRecords.length,
            )
            : 0;

        return {
          modelName: result.modelName,
          avgDuration,
          count: relevantRecords.length,
        };
      })
      .sort((a, b) => a.avgDuration - b.avgDuration);

    actionRecords.forEach((record, index) => {
      if (record.count > 0) {
        const emoji = index === 0 ? "🚀" : "  ";
        console.log(
          `  ${emoji} ${record.modelName.padEnd(30)} ${record.avgDuration}ms (${record.count} calls)`,
        );
      }
    });
  });

  // Failed tests details
  if (failedTests.length > 0) {
    console.log("\n\n⚠️  Failed Tests:");
    console.log("─".repeat(80));
    failedTests.forEach((result) => {
      console.log(`❌ ${result.modelName}`);
      console.log(`   Error: ${result.error}`);
      console.log(
        `   Completed Actions: ${result.records.filter((r) => r.success).length}/${result.records.length}`,
      );
    });
  }

  // Recommendations
  console.log("\n\n💡 Recommendations:");
  console.log("─".repeat(80));

  if (sortedResults.length === 0) {
    console.log("No results to compare.");
    console.log(`\n${"═".repeat(80)}`);
    return;
  }

  const fastest = sortedResults[0];
  const slowest = sortedResults[sortedResults.length - 1];
  const speedDiff = Math.round(
    ((slowest.totalDurationMs - fastest.totalDurationMs) /
      fastest.totalDurationMs) *
    100,
  );

  const fastestCost = fastest.records.reduce(
    (sum, r) => sum + (r.cost || 0),
    0,
  );
  const slowestCost = slowest.records.reduce(
    (sum, r) => sum + (r.cost || 0),
    0,
  );
  const costDiff =
    slowestCost > 0
      ? Math.round(((slowestCost - fastestCost) / fastestCost) * 100)
      : 0;

  console.log(
    `🏆 Fastest Model: ${fastest.modelName} (${fastest.totalDurationMs}ms, ${formatCost(fastestCost)})`,
  );
  console.log(
    `🐌 Slowest Model: ${slowest.modelName} (${slowest.totalDurationMs}ms, ${formatCost(slowestCost)})`,
  );
  console.log(`⚡ Speed Gap: ${speedDiff}% difference`);
  if (costDiff !== 0) {
    console.log(
      `💵 Cost Gap: ${Math.abs(costDiff)}% ${costDiff > 0 ? "more expensive" : "cheaper"}`,
    );
  }

  if (speedDiff > 50) {
    console.log(
      `\n🚀 ${fastest.modelName} is significantly faster - great for production user experience.`,
    );
  }

  if (Math.abs(costDiff) > 100) {
    const cheaper = costDiff > 0 ? fastest : slowest;
    console.log(
      `💰 ${cheaper.modelName} is much more cost-effective for high-volume usage.`,
    );
  }

  // Cost vs Speed consideration
  console.log(
    "\n⚖️  Balance speed, cost, and quality for your production use case.",
  );

  console.log(`\n${"═".repeat(80)}`);
}

// ============================================================================
// Main Test Runner
// ============================================================================

/**
 * Main playground runner
 */
async function runLatencyTests(config: TestConfig) {
  console.log("🚀 LLM Latency Testing Playground");
  console.log("═".repeat(80));
  console.log(
    `Testing ${config.models.length} models with a complete form conversation flow`,
  );
  console.log("\nConversation Flow:");
  console.log("  1. Generate first question");
  console.log("  2. Extract answer from user response (4 fields)");
  console.log("  3. Generate next question (3 follow-ups)");
  console.log("  4. Generate end message");
  console.log("  5. Generate conversation name");
  console.log("\nTotal LLM calls per model: ~9-10 calls");

  const results: ModelTestResult[] = [];

  for (let i = 0; i < config.models.length; i++) {
    const { name, model } = config.models[i];

    if (i > 0) {
      console.log("\n⏳ Waiting 2 seconds before next test...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const result = await simulateConversation(name, model);
    results.push(result);
  }

  displayResults(results);
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: TestConfig = {
  models: [
    // {
    //   name: DEFAULT_OPENAI_MODEL_NAME,
    //   model: openai(DEFAULT_OPENAI_MODEL_NAME),
    // },
    { name: "GPT-4.1 Nano", model: openai("gpt-4.1-nano") },
    // { name: "GPT-5 Mini", model: openai("gpt-5-mini-2025-08-07") },
    // { name: "GPT-4 Mini", model: openai("gpt-4-mini-2025-04-16") },
    // { name: "GPT-5 Chat", model: openai("gpt-5-chat-latest") },
    // { name: "GPT-4 Turbo", model: openai("gpt-4-turbo") },
  ],
};

// ============================================================================
// Export & Auto-run
// ============================================================================

export {
  runLatencyTests,
  simulateConversation,
  type TestConfig,
  type ModelTestResult,
};

// Auto-run if executed directly
if (require.main === module) {
  console.log("\n⚙️  Using default model configuration");
  console.log(
    "   Customize by creating your own config and calling runLatencyTests(config)\n",
  );

  runLatencyTests(DEFAULT_CONFIG)
    .catch((error) => {
      console.error("\n💥 Fatal error:", error);
      exit(1);
    })
    .finally(() => {
      console.log("\n✅ Testing complete!");
      exit(0);
    });
}
