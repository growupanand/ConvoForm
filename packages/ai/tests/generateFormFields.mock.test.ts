import { describe, expect, it } from "bun:test";
import { MockLanguageModelV2 } from "ai/test";
import { generateFormFields } from "../src/ai-actions/generateFormFields";

describe("generateFormFields with MockLanguageModelV2", () => {
  it("should generate form fields", async () => {
    const mockFields = [
      {
        fieldName: "Full Name",
        fieldDescription: "Enter your full name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
      {
        fieldName: "Email",
        fieldDescription: "Enter your email",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
    ];

    const model = new MockLanguageModelV2({
      doGenerate: async () => ({
        finishReason: "stop",
        usage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
        content: [
          {
            type: "text",
            text: JSON.stringify({
              formName: "Contact Form",
              formDescription: "A simple contact form",
              fields: mockFields,
              reasoning: "Standard fields for contact",
              confidence: 0.9,
              estimatedCompletionTime: 2,
            }),
          },
        ],
        warnings: [],
      }),
    });

    const result = await generateFormFields({
      formContext: "Create a contact form",
      model,
    });

    expect(result.object.formName).toBe("Contact Form");
    expect(result.object.fields).toHaveLength(2);
    expect(result.object.fields[0].fieldName).toBe("Full Name");
  });

  it("should handle datePicker ISO conversion logic", async () => {
    const mockFields = [
      {
        fieldName: "Start Date",
        fieldDescription: "When to start",
        fieldConfiguration: {
          inputType: "datePicker",
          inputConfiguration: {
            minDate: "2023-01-01", // Date only string, should be converted
          },
        },
      },
    ];

    const model = new MockLanguageModelV2({
      doGenerate: async () => ({
        finishReason: "stop",
        usage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
        content: [
          {
            type: "text",
            text: JSON.stringify({
              formName: "Date Form",
              formDescription: "Form with date",
              fields: mockFields,
              reasoning: "Testing date conversion",
              confidence: 0.9,
              estimatedCompletionTime: 1,
            }),
          },
        ],
        warnings: [],
      }),
    });

    const result = await generateFormFields({
      formContext: "Create a form with date",
      model,
    });

    const generatedField = result.object.fields[0];
    const config = generatedField.fieldConfiguration.inputConfiguration as any;

    // logic in generateFormFields converts YYYY-MM-DD to ISO
    expect(config.minDate).toBe("2023-01-01T00:00:00.000Z");
  });
});
