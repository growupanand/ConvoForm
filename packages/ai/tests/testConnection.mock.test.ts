import { describe, expect, it } from "bun:test";
import { testAiProviderConnection } from "../src/byok/testConnection";

const secret = "sk-test-fake-key-1234567890";
const accountId = "0123456789abcdef0123456789abcdef";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function openAiChatResponse(content = "OK"): Response {
  return jsonResponse({
    id: "chatcmpl-test",
    object: "chat.completion",
    created: 1,
    model: "gpt-4o-mini",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 },
  });
}

function stubFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Response,
): typeof fetch {
  return handler as unknown as typeof fetch;
}

describe("testAiProviderConnection", () => {
  it("passes for an OpenAI key with a minimal real call", async () => {
    let requestedUrl = "";
    let authorization = "";
    let body = "";

    const result = await testAiProviderConnection({
      provider: "openai",
      secret,
      fetch: stubFetch(async (input, init) => {
        requestedUrl = input instanceof Request ? input.url : input.toString();
        authorization = new Headers(init?.headers).get("authorization") ?? "";
        body = String(init?.body ?? "");
        return openAiChatResponse();
      }),
    });

    expect(result).toEqual({
      ok: true,
      provider: "openai",
      model: "gpt-4o-mini",
    });
    expect(requestedUrl).toContain("/chat/completions");
    expect(authorization).toBe(`Bearer ${secret}`);
    expect(body).not.toContain(secret);
  });

  it("honours a model override", async () => {
    const result = await testAiProviderConnection({
      provider: "openai",
      secret,
      model: "gpt-4.1-nano",
      fetch: stubFetch(async () => openAiChatResponse()),
    });

    expect(result).toMatchObject({ ok: true, model: "gpt-4.1-nano" });
  });

  it("maps 401 to invalid_credentials without echoing the secret", async () => {
    const result = await testAiProviderConnection({
      provider: "openai",
      secret,
      fetch: stubFetch(async () =>
        jsonResponse({ error: { message: `bad key ${secret}` } }, 401),
      ),
    });

    expect(result).toMatchObject({
      ok: false,
      errorCode: "invalid_credentials",
    });
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("maps 403, 404, 429 and 5xx responses", async () => {
    const cases = [
      [403, "forbidden"],
      [404, "not_found"],
      [429, "rate_limited"],
      [500, "provider_error"],
      [400, "provider_error"],
    ] as const;

    for (const [status, errorCode] of cases) {
      const result = await testAiProviderConnection({
        provider: "openai",
        secret,
        fetch: stubFetch(async () => jsonResponse({}, status)),
      });

      expect(result).toMatchObject({ ok: false, errorCode });
    }
  });

  it("maps network failures to network_error", async () => {
    const result = await testAiProviderConnection({
      provider: "openai",
      secret,
      fetch: stubFetch(() => {
        throw new TypeError("fetch failed");
      }),
    });

    expect(result).toMatchObject({ ok: false, errorCode: "network_error" });
  });

  it("times out without hanging", async () => {
    const result = await testAiProviderConnection({
      provider: "openai",
      secret,
      timeoutMs: 20,
      fetch: stubFetch(() => new Promise<Response>(() => undefined)),
    });

    expect(result).toMatchObject({ ok: false, errorCode: "timeout" });
  });

  it("rejects a custom provider without a base URL", async () => {
    let called = false;
    const result = await testAiProviderConnection({
      provider: "custom",
      secret,
      fetch: stubFetch(async () => {
        called = true;
        return openAiChatResponse();
      }),
    });

    expect(result).toMatchObject({
      ok: false,
      errorCode: "invalid_configuration",
    });
    expect(called).toBe(false);
  });

  it("tests a custom provider against the supplied base URL", async () => {
    let requestedUrl = "";
    const result = await testAiProviderConnection({
      provider: "custom",
      secret,
      baseUrl: "https://llm.example.com/v1/",
      fetch: stubFetch(async (input) => {
        requestedUrl = input instanceof Request ? input.url : input.toString();
        return openAiChatResponse();
      }),
    });

    expect(result).toMatchObject({ ok: true, provider: "custom" });
    expect(requestedUrl).toBe("https://llm.example.com/v1/chat/completions");
  });

  it("tests Cloudflare Clef with the account id and token", async () => {
    let requestedUrl = "";
    let authorization = "";

    const result = await testAiProviderConnection({
      provider: "cloudflare",
      secret,
      accountId,
      fetch: stubFetch(async (input, init) => {
        requestedUrl = input instanceof Request ? input.url : input.toString();
        authorization = new Headers(init?.headers).get("authorization") ?? "";
        return jsonResponse({ success: true, result: {} });
      }),
    });

    expect(result).toMatchObject({
      ok: true,
      provider: "cloudflare",
      model: "@cf/cloudflare/clef-flash",
    });
    expect(requestedUrl).toContain(`/accounts/${accountId}/ai/run/`);
    expect(requestedUrl).toContain("@cf/cloudflare/clef-flash");
    expect(authorization).toBe(`Bearer ${secret}`);
  });

  it("rejects Cloudflare without an account id", async () => {
    const result = await testAiProviderConnection({
      provider: "cloudflare",
      secret,
      fetch: stubFetch(async () => jsonResponse({ success: true })),
    });

    expect(result).toMatchObject({
      ok: false,
      errorCode: "invalid_configuration",
    });
  });

  it("maps a Cloudflare 401 to invalid_credentials", async () => {
    const result = await testAiProviderConnection({
      provider: "cloudflare",
      secret,
      accountId,
      fetch: stubFetch(async () => jsonResponse({ success: false }, 401)),
    });

    expect(result).toMatchObject({
      ok: false,
      errorCode: "invalid_credentials",
    });
  });
});
