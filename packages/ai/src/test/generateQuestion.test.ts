/**
 * Bun test suite for generateFieldQuestion function
 * Tests question generation with various scenarios
 */

import { describe, expect, test } from "bun:test";
import type { CollectedData } from "@convoform/db/src/schema";
import {
  type GenerateFieldQuestionParams,
  generateFieldQuestion,
} from "../conversationV5/ai-actions/generateQuestion";

// Mock data for testing
const mockFormOverview =
  "A comprehensive job application form for a software engineering position";

const mockCurrentField: CollectedData = {
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

describe("generateFieldQuestion", () => {
  test("should generate welcoming first question", async () => {
    const testParams: GenerateFieldQuestionParams = {
      formOverview: mockFormOverview,
      currentField: mockCurrentField,
      collectedData: [],
      transcript: [],
      isFirstQuestion: true,
    };

    const result = await generateFieldQuestion(testParams);

    expect(result.object.question).toBeTruthy();
    expect(result.object.isFollowUp).toBe(false);
    expect(result.object.confidence).toBeGreaterThan(0.7);
    expect(result.object.reasoning).toBeTruthy();
  });

  test("should generate contextual follow-up question", async () => {
    const collectedData: CollectedData[] = [
      {
        fieldName: "fullName",
        fieldDescription: "Your full legal name",
        fieldValue: "John Smith",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
    ];

    const transcript = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "Hello! What's your name?" },
      { role: "user" as const, content: "My name is John Smith" },
    ];

    const testParams: GenerateFieldQuestionParams = {
      formOverview: mockFormOverview,
      currentField: {
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
      collectedData,
      transcript,
      isFirstQuestion: false,
    };

    const result = await generateFieldQuestion(testParams);

    expect(result.object.question).toBeTruthy();
    expect(result.object.isFollowUp).toBe(true);
    expect(result.object.confidence).toBeGreaterThan(0.7);
    expect(result.object.question).toBeTruthy();
    expect(result.object.question.length).toBeGreaterThan(0);
  });

  test("should handle empty transcript with collected data", async () => {
    const collectedData: CollectedData[] = [
      {
        fieldName: "name",
        fieldDescription: "Your name",
        fieldValue: "Alice Johnson",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
    ];

    const testParams: GenerateFieldQuestionParams = {
      formOverview: "Simple contact form",
      currentField: {
        fieldName: "email",
        fieldDescription: "Your email address",
        fieldValue: null,
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
      collectedData,
      transcript: [],
      isFirstQuestion: false,
    };

    const result = await generateFieldQuestion(testParams);

    expect(result.object.question).toBeTruthy();
    expect(result.object.confidence).toBeGreaterThan(0.5);
    expect(result.object.reasoning).toBeTruthy();
  });

  test("should generate appropriate questions for different field types", async () => {
    const testParams: GenerateFieldQuestionParams = {
      formOverview: "Customer feedback form",
      currentField: {
        fieldName: "satisfaction",
        fieldDescription: "How satisfied are you with our service",
        fieldValue: null,
        fieldConfiguration: {
          inputType: "rating" as const,
          inputConfiguration: {
            maxRating: 5,
            requireConfirmation: true,
            iconType: "STAR",
            lowLabel: "Not Satisfied",
            highLabel: "Satisfied",
          },
        },
      },
      collectedData: [],
      transcript: [],
      isFirstQuestion: true,
    };

    const result = await generateFieldQuestion(testParams);

    expect(result.object.question).toBeTruthy();
    expect(result.object.question.toLowerCase()).toContain("satisfied");
    expect(result.object.confidence).toBeGreaterThan(0.7);
  });
});
