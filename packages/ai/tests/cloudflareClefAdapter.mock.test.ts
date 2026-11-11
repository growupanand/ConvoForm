import { describe, expect, it } from "bun:test";
import {
  DecisionProviderError,
  InvalidDecisionResponseError,
  MissingDecisionCredentialsError,
  createCloudflareClefAdapter,
} from "../src/decision";
import type { AnswerSufficiencyInput } from "../src/decision";

const input: AnswerSufficiencyInput = {
  fieldQuestion: "What is your current job title?",
  fieldType: "text",
  answer: "Backend engineer",
  recentTurns: [
    { role: "assistant", content: "What is your current job title?" },
  ],
};

type CapturedRequest = {
  url: string;
  init: RequestInit;
};

function createFetchMock(
  response: { ok?: boolean; status?: number; json?: unknown },
  captured?: CapturedRequest[],
): typeof fetch {
  return (async (url: string | URL | Request, init?: RequestInit) => {
    if (captured) {
      captured.push({ url: String(url), init: init ?? {} });
    }

    return {
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: async () => response.json,
    } as Response;
  }) as typeof fetch;
}

const signal = () => new AbortController().signal;

describe("cloudflareClef adapter", () => {
  it("sends a Clef noul question and parses the wrapped REST response", async () => {
    const captured: CapturedRequest[] = [];
    const adapter = createCloudflareClefAdapter(
      {
        accountId: "account_123",
        apiToken: "token_123",
        fetch: createFetchMock(
          {
            json: {
              result: {
                answers: { sufficient: { type: "noul", noul: 0.92 } },
              },
              success: true,
            },
          },
          captured,
        ),
      },
      "@cf/cloudflare/clef-flash",
    );

    const result = await adapter.check(input, { signal: signal() });

    expect(result).toEqual({ sufficient: true, confidence: 0.92 });

    const request = captured[0];
    expect(request?.url).toBe(
      "https://api.cloudflare.com/client/v4/accounts/account_123/ai/run/@cf/cloudflare/clef-flash",
    );
    expect(request?.init.method).toBe("POST");
    expect(request?.init.headers).toEqual({
      Authorization: "Bearer token_123",
      "Content-Type": "application/json",
    });

    const body = JSON.parse(String(request?.init.body));
    expect(body.model).toBe("clef-flash");
    expect(body.state).toContain("Backend engineer");
    expect(body.state).toContain("What is your current job title?");
    expect(body.state).toContain("assistant: What is your current job title?");
    expect(body.questions.sufficient.type).toBe("noul");
  });

  it("accepts the unwrapped binding response shape", async () => {
    const adapter = createCloudflareClefAdapter({
      accountId: "account_123",
      apiToken: "token_123",
      fetch: createFetchMock({
        json: { answers: { sufficient: { type: "noul", noul: 0.3 } } },
      }),
    });

    const result = await adapter.check(input, { signal: signal() });

    expect(result).toEqual({ sufficient: false, confidence: 0.3 });
  });

  it("throws when credentials are missing", async () => {
    const adapter = createCloudflareClefAdapter({
      accountId: "",
      apiToken: "",
      fetch: createFetchMock({ json: {} }),
    });

    const error = await adapter
      .check(input, { signal: signal() })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(MissingDecisionCredentialsError);
  });

  it("throws a provider error for non-2xx responses", async () => {
    const adapter = createCloudflareClefAdapter({
      accountId: "account_123",
      apiToken: "token_123",
      fetch: createFetchMock({ ok: false, status: 503 }),
    });

    const error = await adapter
      .check(input, { signal: signal() })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(DecisionProviderError);
    expect(error.reason).toBe("provider_error");
    expect(error.httpStatus).toBe(503);
  });

  it("throws an invalid-response error for malformed payloads", async () => {
    const adapter = createCloudflareClefAdapter({
      accountId: "account_123",
      apiToken: "token_123",
      fetch: createFetchMock({ json: { result: { answers: {} } } }),
    });

    const error = await adapter
      .check(input, { signal: signal() })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(InvalidDecisionResponseError);
  });
});
