import {
  type LanguageModel,
  simulateStreamingMiddleware,
  wrapLanguageModel,
} from "ai";

/** Answer the Playwright submit-form spec types in the public form. */
export const E2E_MOCK_ANSWER = "Ada Lovelace";

/** First question streamed when a respondent starts a blank form conversation. */
export const E2E_MOCK_QUESTION = "What is your name?";

const mockUsage = {
  inputTokens: 10,
  outputTokens: 20,
  totalTokens: 30,
};

const mockGeneratePayload = JSON.stringify({
  answer: E2E_MOCK_ANSWER,
  confidence: 0.95,
  reasoning: "User provided a name",
  isValid: true,
  name: "E2E submission",
  keywords: ["Ada", "Lovelace"],
});

let cachedModel: Exclude<LanguageModel, string> | undefined;

/**
 * Edge-safe mock model for E2E (no `ai/test` import — that bundle pulls MSW).
 */
export function getE2eMockLanguageModel(): Exclude<LanguageModel, string> {
  if (cachedModel) {
    return cachedModel;
  }

  const base: Exclude<LanguageModel, string> = {
    specificationVersion: "v2",
    provider: "e2e-mock",
    modelId: "e2e-mock-model",
    supportedUrls: {},
    doGenerate: async (options) => {
      const isStructuredOutput = options.responseFormat?.type === "json";
      return {
        finishReason: "stop",
        usage: mockUsage,
        content: [
          {
            type: "text",
            text: isStructuredOutput ? mockGeneratePayload : E2E_MOCK_QUESTION,
          },
        ],
        warnings: [],
      };
    },
    doStream: async () => {
      throw new Error("E2E mock uses simulateStreamingMiddleware for streams");
    },
  };

  cachedModel = wrapLanguageModel({
    model: base,
    middleware: simulateStreamingMiddleware(),
  });

  return cachedModel;
}
