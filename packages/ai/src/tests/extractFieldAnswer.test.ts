/**
 * Bun test suite for extractFieldAnswer function
 * Tests answer extraction with various scenarios
 */

import { describe, expect, test } from "bun:test";
import {
  type ExtractFieldAnswerParams,
  extractFieldAnswer,
} from "../ai-actions/extractFieldAnswer";

// Mock data for testing
const mockFormOverview =
  "A comprehensive job application form for software engineers";

const mockField = {
  id: "field-1",
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
    const testParams: ExtractFieldAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: mockTranscript,
    };

    const result = await extractFieldAnswer(testParams);

    expect(result.object.answer).toBe("5 years");
    expect(result.object.confidence).toBeGreaterThan(0);
    expect(result.object.reasoning).toBeTruthy();
  });

  test("should handle invalid answers appropriately", async () => {
    const invalidTranscript = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "What's your experience?" },
      { role: "user" as const, content: "I don't want to answer this" },
    ];

    const testParams: ExtractFieldAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: invalidTranscript,
    };

    const result = await extractFieldAnswer(testParams);

    expect(result.object.answer).toBeNull();
    expect(result.object.confidence).toBeLessThan(0.5);
  });

  test("should handle empty transcript gracefully", async () => {
    const testParams: ExtractFieldAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: [],
    };

    const result = await extractFieldAnswer(testParams);

    expect(result.object.answer).toBeNull();
    expect(result.object.isValid).toBe(false);
    expect(result.object.confidence).toBeLessThan(0.5);
    expect(result.object.reasoning).toBeTruthy();
  });

  test("should extract specific values from multiple choice options", async () => {
    const specificTranscript = [
      { role: "assistant" as const, content: "How many years?" },
      { role: "user" as const, content: "I have 7 years of experience" },
    ];

    const testParams: ExtractFieldAnswerParams = {
      formOverview: mockFormOverview,
      currentField: mockField,
      transcript: specificTranscript,
    };

    const result = await extractFieldAnswer(testParams);
    expect(result.object.answer).toBeTruthy();
    expect(result.object.isValid).toBe(true);
    expect(result.object.confidence).toBeGreaterThan(0);
    expect(result.object.reasoning).toBeTruthy();
  });
});
