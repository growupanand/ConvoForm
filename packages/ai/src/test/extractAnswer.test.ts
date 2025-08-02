/**
 * Bun test suite for extractFieldAnswer function
 * Tests answer extraction with various scenarios
 */

import { describe, expect, test } from "bun:test";
import { extractFieldAnswer } from "../conversationV5/extractAnswer";
import type { ExtractAnswerParams } from "../conversationV5/types";

// Mock data for testing
const mockFormOverview =
  "A comprehensive job application form for software engineers";

const mockField = {
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
};

const mockTranscript = [
  { role: "user" as const, content: "Hi" },
  {
    role: "assistant" as const,
    content: "Hello! What's your experience level?",
  },
  { role: "user" as const, content: "I have 5 years of experience" },
];

describe("extractFieldAnswer", () => {
  test("should extract valid answer from transcript", async () => {
    const testParams: ExtractAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: mockTranscript,
    };

    const result = await extractFieldAnswer(testParams);

    expect(result.value).toBe("5 years");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.reasoning).toBeTruthy();
  });

  test("should handle invalid answers appropriately", async () => {
    const invalidTranscript = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "What's your experience?" },
      { role: "user" as const, content: "I don't want to answer this" },
    ];

    const testParams: ExtractAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: invalidTranscript,
    };

    const result = await extractFieldAnswer(testParams);

    expect(result.value).toBeNull();
    expect(result.confidence).toBeLessThan(0.5);
  });

  test("should handle empty transcript gracefully", async () => {
    const testParams: ExtractAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: [],
    };

    const result = await extractFieldAnswer(testParams);

    expect(result.value).toBeNull();
    expect(result.reasoning).toContain("Insufficient");
  });

  test("should extract specific values from multiple choice options", async () => {
    const specificTranscript = [
      { role: "assistant" as const, content: "How many years?" },
      { role: "user" as const, content: "I have 7 years of experience" },
    ];

    const testParams: ExtractAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: specificTranscript,
    };

    const result = await extractFieldAnswer(testParams);

    expect(result).toHaveProperty("value");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("reasoning");
    expect(typeof result.confidence).toBe("number");
    expect(typeof result.reasoning).toBe("string");
  });
});
