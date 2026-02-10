import { describe, expect, it } from "bun:test";
import { inputTypeEnum } from "@convoform/db/src/schema";
import { MockLanguageModelV2 } from "ai/test";
import { extractFieldAnswer } from "../ai-actions/extractFieldAnswer";

describe("extractFieldAnswer with MockLanguageModelV2", () => {
  const mockField = {
    id: "field_123",
    fieldName: "Email",
    fieldDescription: "User email address",
    formId: "form_123",
    fieldConfiguration: {
      inputType: inputTypeEnum.enum.text, // "text"
      inputConfiguration: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    fieldValue: null,
  };

  const mockTranscript = [
    {
      role: "assistant" as const,
      content: "What is your email?",
      createdAt: new Date(),
    },
    {
      role: "user" as const,
      content: "my email is test@example.com",
      createdAt: new Date(),
    },
  ];

  it("should extract a valid answer", async () => {
    const model = new MockLanguageModelV2({
      doGenerate: async () => ({
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        content: [
          {
            type: "text",
            text: JSON.stringify({
              answer: "test@example.com",
              confidence: 0.95,
              reasoning: "User explicitly provided email",
              isValid: true,
            }),
          },
        ],
        warnings: [],
      }),
    });

    const result = await extractFieldAnswer({
      formOverview: "Contact Form",
      transcript: mockTranscript,
      currentField: mockField,
      model,
    });

    expect(result.object).toEqual({
      answer: "test@example.com",
      confidence: 0.95,
      reasoning: "User explicitly provided email",
      isValid: true,
    });
  });

  it("should handle null answer extraction", async () => {
    const model = new MockLanguageModelV2({
      doGenerate: async () => ({
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 20 },
        content: [
          {
            type: "text",
            text: JSON.stringify({
              answer: null,
              confidence: 0.2,
              reasoning: "No answer found",
              isValid: false,
            }),
          },
        ],
        warnings: [],
      }),
    });

    const result = await extractFieldAnswer({
      formOverview: "Contact Form",
      transcript: [],
      currentField: mockField,
      model,
    });

    expect(result.object.answer).toBeNull();
    expect(result.object.isValid).toBe(false);
  });
});
