/**
 * Bun test suite for generateFieldQuestion function
 * Tests question generation with various scenarios
 */

import { describe, expect, test } from "bun:test";
import type { FormFieldResponses } from "@convoform/db/src/schema";
import {
  type StreamFieldQuestionParams,
  streamFieldQuestion,
} from "../ai-actions/streamFieldQuestion";

// Mock data for testing
const mockFormOverview =
  "A comprehensive job application form for a software engineering position";

const mockCurrentField: FormFieldResponses = {
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

describe("generateFieldQuestion", () => {
  test("should generate welcoming first question", async () => {
    const testParams: StreamFieldQuestionParams = {
      formOverview: mockFormOverview,
      currentField: mockCurrentField,
      formFieldResponses: [],
      transcript: [],
      isFirstQuestion: true,
    };

    const result = streamFieldQuestion(testParams);

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    expect(fullText).toBeTruthy();
    expect(fullText.length).toBeGreaterThan(0);
    expect(typeof fullText).toBe("string");
  });

  test("should generate contextual follow-up question", async () => {
    const formFieldResponses: FormFieldResponses[] = [
      {
        id: "field-1",
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

    const testParams: StreamFieldQuestionParams = {
      formOverview: mockFormOverview,
      currentField: {
        id: "field-2",
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
      formFieldResponses,
      transcript,
      isFirstQuestion: false,
    };

    const result = streamFieldQuestion(testParams);

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    expect(fullText).toBeTruthy();
    expect(fullText.length).toBeGreaterThan(0);
    expect(typeof fullText).toBe("string");
  });

  test("should handle empty transcript with collected data", async () => {
    const formFieldResponses: FormFieldResponses[] = [
      {
        id: "field-1",
        fieldName: "name",
        fieldDescription: "Your name",
        fieldValue: "Alice Johnson",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
    ];

    const testParams: StreamFieldQuestionParams = {
      formOverview: "Simple contact form",
      currentField: {
        id: "field-2",
        fieldName: "email",
        fieldDescription: "Your email address",
        fieldValue: null,
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
      formFieldResponses,
      transcript: [],
      isFirstQuestion: false,
    };

    const result = streamFieldQuestion(testParams);

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    expect(fullText).toBeTruthy();
    expect(fullText.length).toBeGreaterThan(0);
    expect(typeof fullText).toBe("string");
  });

  test("should generate appropriate questions for different field types", async () => {
    const testParams: StreamFieldQuestionParams = {
      formOverview: "Customer feedback form",
      currentField: {
        id: "field-1",
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
      formFieldResponses: [],
      transcript: [],
      isFirstQuestion: true,
    };

    const result = streamFieldQuestion(testParams);

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    expect(fullText).toBeTruthy();
    expect(fullText.length).toBeGreaterThan(0);
    expect(typeof fullText).toBe("string");
  });
});
