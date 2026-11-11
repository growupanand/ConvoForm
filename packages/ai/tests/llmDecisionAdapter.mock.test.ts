import { describe, expect, it } from "bun:test";
import type { LanguageModel } from "ai";
import {
  InvalidDecisionResponseError,
  createLlmDecisionAdapter,
} from "../src/decision";
import type { AnswerSufficiencyInput } from "../src/decision";

const config = {
  provider: "groq" as const,
  model: "openai/gpt-oss-120b",
};

const input: AnswerSufficiencyInput = {
  fieldQuestion: "Describe your work experience.",
  fieldType: "text",
  answer: "Five years as a nurse",
  recentTurns: [
    { role: "assistant", content: "Describe your work experience." },
  ],
};

const signal = () => new AbortController().signal;

describe("llm decision adapter", () => {
  it("returns the generated decision and passes prompt context", async () => {
    let captured:
      | {
          model: LanguageModel;
          system: string;
          prompt: string;
          abortSignal: AbortSignal;
        }
      | undefined;

    const adapter = createLlmDecisionAdapter(config, {
      generate: async (args) => {
        captured = args;
        return { object: { sufficient: true, confidence: 0.88 } };
      },
    });

    const result = await adapter.check(input, { signal: signal() });

    expect(result).toEqual({ sufficient: true, confidence: 0.88 });
    expect(captured?.prompt).toContain("Five years as a nurse");
    expect(captured?.prompt).toContain("Describe your work experience.");
    expect(captured?.prompt).toContain("Type: text");
    expect(captured?.system).toContain("Hinglish");
    expect(captured?.abortSignal).toBeInstanceOf(AbortSignal);
  });

  it("uses the injected model", async () => {
    const model = { modelId: "fake-model" } as LanguageModel;
    let capturedModel: LanguageModel | undefined;

    const adapter = createLlmDecisionAdapter(config, {
      model,
      generate: async (args) => {
        capturedModel = args.model;
        return { object: { sufficient: false, confidence: 0.2 } };
      },
    });

    const result = await adapter.check(input, { signal: signal() });

    expect(result).toEqual({ sufficient: false, confidence: 0.2 });
    expect(capturedModel).toBe(model);
  });

  it("rejects malformed output", async () => {
    const adapter = createLlmDecisionAdapter(config, {
      generate: async () =>
        ({
          object: { sufficient: "yes", confidence: 2 },
        }) as unknown as {
          object: { sufficient: boolean; confidence: number };
        },
    });

    const error = await adapter
      .check(input, { signal: signal() })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(InvalidDecisionResponseError);
  });
});
