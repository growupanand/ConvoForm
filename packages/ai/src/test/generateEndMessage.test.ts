/**
 * Bun test suite for generateEndMessage function
 * Tests end message generation with various scenarios
 */

import { describe, expect, test } from "bun:test";
import type { CollectedData } from "@convoform/db/src/schema";
import {
  type GenerateEndMessageParams,
  generateEndMessage,
} from "../conversationV5/ai-actions/generateEndMessage";

const mockFormOverview =
  "A comprehensive job application form for software engineers";

describe("generateEndMessage", () => {
  test("should generate appropriate end message with collected data", async () => {
    const collectedData: CollectedData[] = [
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
      {
        id: "field-3",
        fieldName: "technicalSkills",
        fieldDescription: "Your primary programming languages and technologies",
        fieldValue: "JavaScript, React, Node.js, Python",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {
            placeholder: "e.g., JavaScript, Python, React, Node.js",
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
      {
        role: "assistant" as const,
        content: "Excellent! What are your primary technical skills?",
      },
      {
        role: "user" as const,
        content: "I'm proficient in JavaScript, React, Node.js, and Python",
      },
    ];

    const testParams: GenerateEndMessageParams = {
      formOverview: mockFormOverview,
      collectedData,
      transcript,
    };

    const result = await generateEndMessage(testParams);

    expect(result.object).toHaveProperty("title");
    expect(result.object).toHaveProperty("message");
    expect(typeof result.object.title).toBe("string");
    expect(typeof result.object.message).toBe("string");
    expect(result.object.title.length).toBeGreaterThan(0);
    expect(result.object.message.length).toBeGreaterThan(0);
  });

  test("should handle minimal collected data", async () => {
    const collectedData: CollectedData[] = [
      {
        id: "field-1",
        fieldName: "name",
        fieldDescription: "Your name",
        fieldValue: "Alice",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
      },
    ];

    const transcript = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "Hello! What's your name?" },
      { role: "user" as const, content: "My name is Alice" },
    ];

    const testParams: GenerateEndMessageParams = {
      formOverview: "Simple contact form",
      collectedData,
      transcript,
    };

    const result = await generateEndMessage(testParams);

    expect(result.object).toHaveProperty("title");
    expect(result.object).toHaveProperty("message");
    expect(result.object.title.length).toBeGreaterThan(0);
    expect(result.object.message.length).toBeGreaterThan(0);
  });

  test("should handle empty collected data gracefully", async () => {
    const collectedData: CollectedData[] = [];
    const transcript: Array<{ role: "user" | "assistant"; content: string }> =
      [];

    const testParams: GenerateEndMessageParams = {
      formOverview: "Simple feedback form",
      collectedData,
      transcript,
    };

    const result = await generateEndMessage(testParams);

    expect(result.object).toHaveProperty("title");
    expect(result.object).toHaveProperty("message");
    expect(result.object.title.length).toBeGreaterThan(0);
    expect(result.object.message.length).toBeGreaterThan(0);
  });
});
