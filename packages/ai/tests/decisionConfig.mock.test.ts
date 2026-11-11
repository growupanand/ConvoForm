import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CLOUDFLARE_CLEF_MODEL,
  DEFAULT_DECISION_LLM_MODEL,
  DEFAULT_DECISION_LLM_PROVIDER,
  DEFAULT_DECISION_THRESHOLD,
  DEFAULT_DECISION_TIMEOUT_MS,
  getDecisionConfig,
  parseDecisionLlmModel,
  parseDecisionModel,
  parseDecisionThreshold,
  parseDecisionTimeoutMs,
} from "../src/decision";

describe("parseDecisionThreshold", () => {
  it("returns the default when unset", () => {
    expect(parseDecisionThreshold(undefined)).toBe(DEFAULT_DECISION_THRESHOLD);
    expect(parseDecisionThreshold("")).toBe(DEFAULT_DECISION_THRESHOLD);
    expect(parseDecisionThreshold("   ")).toBe(DEFAULT_DECISION_THRESHOLD);
  });

  it("accepts values between 0 and 1", () => {
    expect(parseDecisionThreshold("0")).toBe(0);
    expect(parseDecisionThreshold("0.55")).toBe(0.55);
    expect(parseDecisionThreshold("1")).toBe(1);
  });

  it("falls back for invalid values", () => {
    for (const value of ["abc", "-0.1", "1.1", "NaN", "0.5abc"]) {
      expect(parseDecisionThreshold(value)).toBe(DEFAULT_DECISION_THRESHOLD);
    }
  });
});

describe("parseDecisionTimeoutMs", () => {
  it("returns the default when unset or invalid", () => {
    expect(parseDecisionTimeoutMs(undefined)).toBe(DEFAULT_DECISION_TIMEOUT_MS);
    expect(parseDecisionTimeoutMs("0")).toBe(DEFAULT_DECISION_TIMEOUT_MS);
    expect(parseDecisionTimeoutMs("50000")).toBe(DEFAULT_DECISION_TIMEOUT_MS);
    expect(parseDecisionTimeoutMs("abc")).toBe(DEFAULT_DECISION_TIMEOUT_MS);
  });

  it("accepts valid timeouts", () => {
    expect(parseDecisionTimeoutMs("20")).toBe(20);
    expect(parseDecisionTimeoutMs("1500.9")).toBe(1500);
  });
});

describe("parseDecisionModel", () => {
  it("returns the default when unset", () => {
    expect(parseDecisionModel(undefined)).toBe(DEFAULT_CLOUDFLARE_CLEF_MODEL);
    expect(parseDecisionModel("  ")).toBe(DEFAULT_CLOUDFLARE_CLEF_MODEL);
  });

  it("keeps an explicit model", () => {
    expect(parseDecisionModel(" @cf/cloudflare/clef ")).toBe(
      "@cf/cloudflare/clef",
    );
  });
});

describe("parseDecisionLlmModel", () => {
  const fallback = {
    provider: DEFAULT_DECISION_LLM_PROVIDER,
    model: DEFAULT_DECISION_LLM_MODEL,
  };

  it("returns the existing Groq model by default", () => {
    expect(parseDecisionLlmModel(undefined)).toEqual(fallback);
    expect(parseDecisionLlmModel("")).toEqual(fallback);
  });

  it("parses a valid provider:model value", () => {
    expect(parseDecisionLlmModel("openai:gpt-4o-mini")).toEqual({
      provider: "openai",
      model: "gpt-4o-mini",
    });
  });

  it("falls back for invalid providers or models", () => {
    expect(parseDecisionLlmModel("unknown:gpt-4o-mini")).toEqual(fallback);
    expect(parseDecisionLlmModel("groq:not-a-model")).toEqual(fallback);
    expect(parseDecisionLlmModel("gpt-4o-mini")).toEqual(fallback);
    expect(parseDecisionLlmModel(":gpt-4o-mini")).toEqual(fallback);
  });
});

describe("getDecisionConfig", () => {
  it("works with no DECISION_* env vars", () => {
    const env = saveDecisionEnv();
    clearDecisionEnv();

    try {
      expect(getDecisionConfig()).toEqual({
        threshold: DEFAULT_DECISION_THRESHOLD,
        timeoutMs: DEFAULT_DECISION_TIMEOUT_MS,
        cloudflareClef: { model: DEFAULT_CLOUDFLARE_CLEF_MODEL },
        llm: {
          provider: DEFAULT_DECISION_LLM_PROVIDER,
          model: DEFAULT_DECISION_LLM_MODEL,
        },
      });
    } finally {
      restoreDecisionEnv(env);
    }
  });

  it("reads env overrides", () => {
    const env = saveDecisionEnv();
    process.env.DECISION_THRESHOLD = "0.85";
    process.env.DECISION_TIMEOUT_MS = "900";
    process.env.DECISION_MODEL = "@cf/cloudflare/clef";
    process.env.DECISION_LLM_MODEL = "openai:gpt-4o-mini";

    try {
      expect(getDecisionConfig()).toEqual({
        threshold: 0.85,
        timeoutMs: 900,
        cloudflareClef: { model: "@cf/cloudflare/clef" },
        llm: { provider: "openai", model: "gpt-4o-mini" },
      });
    } finally {
      restoreDecisionEnv(env);
    }
  });
});

const DECISION_ENV_KEYS = [
  "DECISION_THRESHOLD",
  "DECISION_TIMEOUT_MS",
  "DECISION_MODEL",
  "DECISION_LLM_MODEL",
] as const;

function saveDecisionEnv() {
  return Object.fromEntries(
    DECISION_ENV_KEYS.map((key) => [key, process.env[key]]),
  ) as Record<(typeof DECISION_ENV_KEYS)[number], string | undefined>;
}

function clearDecisionEnv() {
  for (const key of DECISION_ENV_KEYS) {
    delete process.env[key];
  }
}

function restoreDecisionEnv(
  env: Record<(typeof DECISION_ENV_KEYS)[number], string | undefined>,
) {
  for (const key of DECISION_ENV_KEYS) {
    const value = env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}
