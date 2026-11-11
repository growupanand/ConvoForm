import { describe, expect, it } from "bun:test";
import {
  type AnswerSufficiencyInput,
  type DecisionAdapter,
  type DecisionConfig,
  MissingDecisionCredentialsError,
  checkAnswerSufficiency,
} from "../src/decision";

const input: AnswerSufficiencyInput = {
  fieldQuestion: "What is your current job title?",
  fieldType: "text",
  answer: "ok",
};

const config: DecisionConfig = {
  threshold: 0.7,
  timeoutMs: 50,
  cloudflareClef: { model: "@cf/cloudflare/clef-flash" },
  llm: { provider: "groq", model: "openai/gpt-oss-120b" },
};

function createAdapter(check: DecisionAdapter["check"]): DecisionAdapter {
  return { provider: "cloudflare-clef", check };
}

describe("checkAnswerSufficiency", () => {
  it("returns sufficient without calling an adapter when provider is none", async () => {
    let calls = 0;
    const result = await checkAnswerSufficiency(
      { ...input, provider: "none" },
      {
        config,
        adapters: {
          "cloudflare-clef": createAdapter(async () => {
            calls += 1;
            return { sufficient: false, confidence: 0 };
          }),
        },
      },
    );

    expect(calls).toBe(0);
    expect(result).toEqual({
      sufficient: true,
      confidence: 1,
      provider: "none",
      model: "none",
      latencyMs: 0,
    });
  });

  it("accepts a decision at or above the threshold", async () => {
    const result = await checkAnswerSufficiency(input, {
      config,
      adapters: {
        "cloudflare-clef": createAdapter(async () => ({
          sufficient: true,
          confidence: 0.7,
        })),
      },
    });

    expect(result.sufficient).toBe(true);
    expect(result.confidence).toBe(0.7);
    expect(result.fallbackReason).toBeUndefined();
  });

  it("rejects a decision below the threshold", async () => {
    const result = await checkAnswerSufficiency(input, {
      config,
      adapters: {
        "cloudflare-clef": createAdapter(async () => ({
          sufficient: true,
          confidence: 0.69,
        })),
      },
    });

    expect(result.sufficient).toBe(false);
  });

  it("rejects when the provider verdict is negative", async () => {
    const result = await checkAnswerSufficiency(input, {
      config,
      adapters: {
        "cloudflare-clef": createAdapter(async () => ({
          sufficient: false,
          confidence: 0.95,
        })),
      },
    });

    expect(result.sufficient).toBe(false);
  });

  it("falls back when the check times out", async () => {
    const result = await checkAnswerSufficiency(input, {
      config: { ...config, timeoutMs: 20 },
      adapters: {
        "cloudflare-clef": createAdapter(
          () => new Promise<never>(() => undefined),
        ),
      },
    });

    expect(result.fallbackReason).toBe("timeout");
    expect(result.sufficient).toBe(true);
  });

  it("falls back when credentials are missing", async () => {
    const result = await checkAnswerSufficiency(input, {
      config,
      adapters: {
        "cloudflare-clef": createAdapter(async () => {
          throw new MissingDecisionCredentialsError();
        }),
      },
    });

    expect(result.fallbackReason).toBe("missing_credentials");
    expect(result.sufficient).toBe(true);
  });

  it("falls back on provider errors", async () => {
    const result = await checkAnswerSufficiency(input, {
      config,
      adapters: {
        "cloudflare-clef": createAdapter(async () => {
          throw new Error("boom");
        }),
      },
    });

    expect(result.fallbackReason).toBe("provider_error");
    expect(result.sufficient).toBe(true);
  });

  it("uses the LLM adapter when the form selects it", async () => {
    const result = await checkAnswerSufficiency(
      { ...input, provider: "llm" },
      {
        config,
        adapters: {
          llm: {
            provider: "llm",
            check: async () => ({ sufficient: true, confidence: 0.9 }),
          },
        },
      },
    );

    expect(result.provider).toBe("llm");
    expect(result.model).toBe("groq:openai/gpt-oss-120b");
    expect(result.sufficient).toBe(true);
  });

  it("bypasses the provider during deterministic e2e runs", async () => {
    const previousE2eMock = process.env.E2E_MOCK_LLM;
    process.env.E2E_MOCK_LLM = "1";
    let calls = 0;

    try {
      const result = await checkAnswerSufficiency(input, {
        config,
        adapters: {
          "cloudflare-clef": createAdapter(async () => {
            calls += 1;
            return { sufficient: false, confidence: 0 };
          }),
        },
      });

      expect(calls).toBe(0);
      expect(result.sufficient).toBe(true);
      expect(result.model).toBe("e2e-mock");
    } finally {
      process.env.E2E_MOCK_LLM = previousE2eMock ?? "";
    }
  });
});
