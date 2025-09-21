/**
 * Bun test suite for generateConversationName function
 * Tests conversation name generation with various scenarios
 */

import { describe, expect, test } from "bun:test";
import type { FormFieldResponses } from "@convoform/db/src/schema";
import {
  type GenerateConversationNameParams,
  generateConversationName,
} from "../ai-actions/generateConversationName";

const mockFormOverview =
  "A comprehensive job application form for software engineers";

describe("generateConversationName", () => {
  test("should generate descriptive name with collected data", async () => {
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
      {
        id: "field-2",
        fieldName: "experienceLevel",
        fieldDescription:
          "Your years of professional software development experience",
        fieldValue: "7 years",
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
    ];

    const transcript = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "Hello! What's your name?" },
      { role: "user" as const, content: "My name is John Smith" },
      {
        role: "assistant" as const,
        content: "Great! How many years of experience do you have?",
      },
      { role: "user" as const, content: "I have 7 years of experience" },
    ];

    const testParams: GenerateConversationNameParams = {
      formOverview: mockFormOverview,
      formFieldResponses,
      transcript,
    };

    const result = await generateConversationName(testParams);

    expect(result.object).toHaveProperty("name");
    expect(result.object).toHaveProperty("reasoning");
    expect(typeof result.object.name).toBe("string");
    expect(typeof result.object.reasoning).toBe("string");
    expect(result.object.name.length).toBeGreaterThan(0);
    expect(result.object.reasoning.length).toBeGreaterThan(0);
    console.log("Generated conversation name: ", result.object.name);
  });

  test("should generate name with minimal data", async () => {
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

    const transcript = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "Hello! What's your name?" },
      { role: "user" as const, content: "My name is Alice Johnson" },
    ];

    const testParams: GenerateConversationNameParams = {
      formOverview: "Simple contact form",
      formFieldResponses,
      transcript,
    };

    const result = await generateConversationName(testParams);

    expect(result.object).toHaveProperty("name");
    expect(result.object).toHaveProperty("reasoning");
    expect(result.object.name.length).toBeGreaterThan(0);
    expect(result.object.reasoning.length).toBeGreaterThan(0);
    console.log("Generated conversation name: ", result.object.name);
  });

  test("should handle empty data gracefully", async () => {
    const formFieldResponses: FormFieldResponses[] = [];
    const transcript: Array<{ role: "user" | "assistant"; content: string }> =
      [];

    const testParams: GenerateConversationNameParams = {
      formOverview: "Simple feedback form",
      formFieldResponses,
      transcript,
    };

    const result = await generateConversationName(testParams);

    expect(result.object).toHaveProperty("name");
    expect(result.object).toHaveProperty("reasoning");
    expect(result.object.name.length).toBeGreaterThan(0);
    expect(result.object.reasoning.length).toBeGreaterThan(0);
    console.log("Generated conversation name: ", result.object.name);
  });

  test("should generate unique names for different conversations", async () => {
    const formFieldResponses1: FormFieldResponses[] = [
      {
        id: "field-1",
        fieldName: "company",
        fieldDescription: "Company name",
        fieldValue: "TechCorp",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
    ];

    const formFieldResponses2: FormFieldResponses[] = [
      {
        id: "field-2",
        fieldName: "company",
        fieldDescription: "Company name",
        fieldValue: "StartupXYZ",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
    ];

    const transcript = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "What's your company name?" },
    ];

    const result1 = await generateConversationName({
      formOverview: "Business inquiry form",
      formFieldResponses: formFieldResponses1,
      transcript,
    });

    const result2 = await generateConversationName({
      formOverview: "Business inquiry form",
      formFieldResponses: formFieldResponses2,
      transcript,
    });

    console.log("Generated conversation names: ", [
      result1.object.name,
      result2.object.name,
    ]);

    expect(result1.object.name).not.toBe(result2.object.name);
  }, 10000);
});
