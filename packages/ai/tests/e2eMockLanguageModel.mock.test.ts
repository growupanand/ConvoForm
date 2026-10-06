import { describe, expect, it } from "bun:test";
import { inputTypeEnum } from "@convoform/db/src/schema";
import { extractFieldAnswer } from "../src/ai-actions/extractFieldAnswer";
import { generateConversationName } from "../src/ai-actions/generateConversationName";
import {
  E2E_MOCK_ANSWER,
  getE2eMockLanguageModel,
} from "../src/e2eMockLanguageModel";

describe("getE2eMockLanguageModel", () => {
  const model = getE2eMockLanguageModel();

  const mockField = {
    id: "field_123",
    fieldName: "Name",
    fieldDescription: "Description of the field",
    formId: "form_123",
    fieldConfiguration: {
      inputType: inputTypeEnum.enum.text,
      inputConfiguration: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    fieldValue: null,
  };

  const mockTranscript = [
    {
      role: "assistant" as const,
      content: "What is your name?",
      createdAt: new Date(),
    },
    {
      role: "user" as const,
      content: E2E_MOCK_ANSWER,
      createdAt: new Date(),
    },
  ];

  it("extractFieldAnswer returns the scripted answer", async () => {
    const result = await extractFieldAnswer({
      formOverview: "Test form overview for e2e",
      transcript: mockTranscript,
      currentField: mockField,
      model,
    });

    expect(result.object).toEqual({
      answer: E2E_MOCK_ANSWER,
      confidence: 0.95,
      reasoning: "User provided a name",
      isValid: true,
    });
  });

  it("generateConversationName returns the scripted name", async () => {
    const result = await generateConversationName({
      formOverview: "Test form overview for e2e",
      transcript: mockTranscript,
      formFieldResponses: [],
      model,
    });

    expect(result.object.name).toBe("E2E submission");
    expect(result.object.confidence).toBe(0.95);
    expect(result.object.keywords).toEqual(["Ada", "Lovelace"]);
  });
});
