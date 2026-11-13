import { describe, expect, it } from "bun:test";
import {
  buildLabelQuestions,
  buildLabelState,
  createCloudflareClefLabelProvider,
  generateConversationLabels,
} from "../src/labels";
import type { LabelProvider } from "../src/labels";

const transcript = [
  {
    role: "assistant" as const,
    content: "Which country are you interested in?",
  },
  {
    role: "user" as const,
    content: "UK ke liye MBA karna hai. Fees kitni hai?",
  },
  {
    role: "assistant" as const,
    content: "Tuition is usually £18,000–£30,000 per year.",
  },
];

const formFieldResponses = [
  {
    id: "field_1",
    fieldName: "Country",
    fieldDescription: "Preferred country",
    fieldConfiguration: { inputType: "text" as const },
    fieldValue: "UK",
  },
];

function createProvider(
  resolver: (questionId: string) => { value: string; score: number },
): LabelProvider {
  return {
    provider: "cloudflare-clef",
    async label({ question }) {
      return resolver(question.id);
    },
  };
}

const signalProvider = createProvider((questionId) => {
  if (questionId === "tone") {
    return { value: "casual", score: 0.91 };
  }
  if (questionId === "sentiment") {
    return { value: "positive", score: 0.84 };
  }
  return { value: "Hot", score: 0.78 };
});

describe("generateConversationLabels", () => {
  it("generates tone, sentiment and lead temperature", async () => {
    const labels = await generateConversationLabels(
      {
        transcript,
        formFieldResponses,
        formName: "Study abroad enquiry",
      },
      { provider: signalProvider, silent: true },
    );

    expect(labels.tone?.value).toBe("casual");
    expect(labels.tone?.score).toBe(0.91);
    expect(labels.tone?.provider).toBe("cloudflare-clef");
    expect(labels.tone?.timestamp).toBeInstanceOf(Date);
    expect(labels.sentiment?.value).toBe("positive");
    expect(labels.temperature?.value).toBe("Hot");
    expect(labels.categories).toBeUndefined();
    expect(labels.generatedAt).toBeInstanceOf(Date);
  });

  it("adds custom categories when the form enables them", async () => {
    const labels = await generateConversationLabels(
      {
        transcript,
        formFieldResponses,
        categories: [
          { id: "country", name: "Country", options: ["UK", "Canada"] },
          { id: "budget", name: "Budget", options: ["under ₹20L", "₹20–40L"] },
        ],
      },
      {
        provider: createProvider((questionId) => {
          if (questionId === "category__country") {
            return { value: "UK", score: 0.88 };
          }
          if (questionId === "category__budget") {
            return { value: "₹20–40L", score: 0.72 };
          }
          return { value: "Hot", score: 0.7 };
        }),
        silent: true,
      },
    );

    expect(labels.categories).toEqual([
      {
        categoryId: "country",
        categoryName: "Country",
        value: "UK",
        score: 0.88,
        provider: "cloudflare-clef",
        timestamp: expect.any(Date),
      },
      {
        categoryId: "budget",
        categoryName: "Budget",
        value: "₹20–40L",
        score: 0.72,
        provider: "cloudflare-clef",
        timestamp: expect.any(Date),
      },
    ]);
  });

  it("leaves only a timed-out label empty", async () => {
    const labels = await generateConversationLabels(
      { transcript, formFieldResponses },
      {
        timeoutMs: 20,
        silent: true,
        provider: {
          provider: "cloudflare-clef",
          async label({ question }) {
            if (question.id === "sentiment") {
              return new Promise<never>(() => undefined);
            }

            return signalProvider.label({
              question,
              state: "",
              signal: new AbortController().signal,
            });
          },
        },
      },
    );

    expect(labels.tone?.value).toBe("casual");
    expect(labels.sentiment).toBeUndefined();
    expect(labels.temperature?.value).toBe("Hot");
  });

  it("leaves only a failed label empty", async () => {
    const labels = await generateConversationLabels(
      { transcript, formFieldResponses },
      {
        silent: true,
        provider: {
          provider: "cloudflare-clef",
          async label({ question }) {
            if (question.id === "temperature") {
              throw new Error("provider down");
            }

            return signalProvider.label({
              question,
              state: "",
              signal: new AbortController().signal,
            });
          },
        },
      },
    );

    expect(labels.tone?.value).toBe("casual");
    expect(labels.sentiment?.value).toBe("positive");
    expect(labels.temperature).toBeUndefined();
  });

  it("returns no labels when Workers AI credentials are missing", async () => {
    const keys = [
      "CLOUDFLARE_AI_ACCOUNT_ID",
      "CLOUDFLARE_AI_API_TOKEN",
      "CF_ACCOUNT_ID",
      "CF_API_TOKEN",
    ] as const;
    const previous = keys.map((key) => [key, process.env[key]] as const);
    for (const key of keys) {
      process.env[key] = "";
    }

    try {
      const labels = await generateConversationLabels(
        { transcript, formFieldResponses },
        { silent: true },
      );

      expect(labels.tone).toBeUndefined();
      expect(labels.sentiment).toBeUndefined();
      expect(labels.temperature).toBeUndefined();
    } finally {
      for (const [key, value] of previous) {
        process.env[key] = value ?? "";
      }
    }
  });
});

describe("label questions and state", () => {
  it("builds tone, sentiment, temperature and category questions", () => {
    const questions = buildLabelQuestions([
      { id: "country", name: "Country", options: ["UK", "Canada"] },
    ]);

    expect(questions.map((question) => question.id)).toEqual([
      "tone",
      "sentiment",
      "temperature",
      "category__country",
    ]);
    expect(questions[3]?.criteria.map((criterion) => criterion.value)).toEqual([
      "UK",
      "Canada",
    ]);
  });

  it("includes the form and transcript in the state", () => {
    const state = buildLabelState({
      transcript,
      formFieldResponses,
      formName: "Study abroad enquiry",
      formOverview: "Collects study abroad preferences",
    });

    expect(state).toContain("Form: Study abroad enquiry");
    expect(state).toContain("Country");
    expect(state).toContain("UK ke liye MBA");
  });
});

const toneQuestion = buildLabelQuestions().find(
  (question) => question.id === "tone",
);

if (!toneQuestion) {
  throw new Error("tone question is missing");
}

describe("Cloudflare Clef label provider", () => {
  it("sends a choice question and uses the chosen option probability", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    const provider = createCloudflareClefLabelProvider(
      {
        accountId: "account_1",
        apiToken: "token_1",
        fetch: (async (_url: string | URL | Request, init?: RequestInit) => {
          capturedBody = JSON.parse(String(init?.body));
          return {
            ok: true,
            status: 200,
            json: async () => ({
              result: {
                answers: {
                  tone: {
                    type: "choice",
                    choice: "casual",
                    probabilities: { formal: 0.1, casual: 0.82 },
                    confidence: 0.82,
                  },
                },
              },
            }),
          } as Response;
        }) as typeof fetch,
      },
      "@cf/cloudflare/clef-flash",
    );

    const result = await provider.label({
      question: toneQuestion,
      state: "user: hello",
      signal: new AbortController().signal,
    });

    expect(result).toEqual({ value: "casual", score: 0.82 });
    expect(capturedBody).toMatchObject({
      model: "clef-flash",
      state: "user: hello",
      questions: {
        tone: {
          type: "choice",
          instructions: expect.stringContaining("tone"),
          criteria: expect.objectContaining({ casual: expect.any(String) }),
        },
      },
    });
  });

  it("rejects an option outside the allowed criteria", async () => {
    const provider = createCloudflareClefLabelProvider(
      {
        accountId: "account_1",
        apiToken: "token_1",
        fetch: (async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              answers: {
                tone: {
                  type: "choice",
                  choice: "sarcastic",
                  probabilities: { sarcastic: 0.9 },
                },
              },
            }),
          }) as Response) as typeof fetch,
      },
      "@cf/cloudflare/clef-flash",
    );

    await expect(
      provider.label({
        question: toneQuestion,
        state: "user: hello",
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow("outside the allowed criteria");
  });
});
