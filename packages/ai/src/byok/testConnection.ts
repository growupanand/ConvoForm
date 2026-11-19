import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGuardedFetch } from "@convoform/common";
import type { AiProviderId } from "@convoform/db/src/schema";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type LanguageModel, generateText } from "ai";
import { buildCloudflareClefRequest } from "../decision/cloudflareClef";
import { getByokProvider } from "./providers";

export const DEFAULT_PROVIDER_TEST_TIMEOUT_MS = 15_000;

export const AI_PROVIDER_TEST_ERROR_CODES = [
  "invalid_credentials",
  "forbidden",
  "rate_limited",
  "not_found",
  "timeout",
  "network_error",
  "provider_error",
  "invalid_configuration",
] as const;

export type AiProviderTestErrorCode =
  (typeof AI_PROVIDER_TEST_ERROR_CODES)[number];

export type AiProviderConnectionTestInput = {
  provider: AiProviderId;
  secret: string;
  model?: string;
  accountId?: string;
  baseUrl?: string;
  timeoutMs?: number;
  /** Injectable for tests. */
  fetch?: typeof fetch;
};

export type AiProviderConnectionTestResult =
  | {
      ok: true;
      provider: AiProviderId;
      model: string;
    }
  | {
      ok: false;
      provider: AiProviderId;
      errorCode: AiProviderTestErrorCode;
      /** Safe, UI-ready explanation. Never contains the secret. */
      message: string;
    };

const ERROR_MESSAGES: Record<AiProviderTestErrorCode, string> = {
  invalid_credentials: "The provider rejected this API key.",
  forbidden: "The provider denied access to this key or account.",
  rate_limited: "The provider is rate limiting this key. Try again later.",
  not_found: "The provider could not find the requested model.",
  timeout: "The provider did not respond in time.",
  network_error: "Could not reach the provider.",
  provider_error: "The provider returned an error.",
  invalid_configuration:
    "This provider connection is not configured correctly.",
};

class ProviderTestTimeoutError extends Error {
  constructor() {
    super("Provider connection test timed out");
    this.name = "ProviderTestTimeoutError";
  }
}

/**
 * Makes one small real call with the supplied credentials.
 *
 * The result is intentionally coarse: callers store the error code, never the
 * provider's raw error, because provider messages can echo request details.
 */
export async function testAiProviderConnection(
  input: AiProviderConnectionTestInput,
): Promise<AiProviderConnectionTestResult> {
  const definition = getByokProvider(input.provider);
  const model = input.model?.trim() || definition.defaultTestModel;
  const timeoutMs = input.timeoutMs ?? DEFAULT_PROVIDER_TEST_TIMEOUT_MS;
  const secret = input.secret.trim();

  if (!secret) {
    return failure(input.provider, "invalid_configuration");
  }

  if (definition.requiresAccountId && !input.accountId?.trim()) {
    return failure(input.provider, "invalid_configuration");
  }

  if (definition.requiresBaseUrl && !input.baseUrl?.trim()) {
    return failure(input.provider, "invalid_configuration");
  }

  try {
    const fetchImpl = resolveFetch(input);

    await withTimeout(
      (signal) =>
        definition.testMode === "cloudflare-clef"
          ? runCloudflareClefTest({
              secret,
              accountId: input.accountId ?? "",
              model,
              fetchImpl,
              signal,
            })
          : runLanguageModelTest({
              provider: input.provider,
              secret,
              model,
              baseUrl: input.baseUrl,
              fetchImpl,
              signal,
            }),
      timeoutMs,
    );

    return { ok: true, provider: input.provider, model };
  } catch (error) {
    return failure(input.provider, mapTestError(error));
  }
}

function failure(
  provider: AiProviderId,
  errorCode: AiProviderTestErrorCode,
): AiProviderConnectionTestResult {
  return {
    ok: false,
    provider,
    errorCode,
    message: ERROR_MESSAGES[errorCode],
  };
}

function resolveFetch(input: AiProviderConnectionTestInput): typeof fetch {
  if (input.fetch) {
    return input.fetch;
  }

  if (input.provider === "custom") {
    // Custom hosts are user-supplied: re-check DNS and refuse redirects.
    return createGuardedFetch({ subject: "AI provider base URL" });
  }

  return fetch;
}

async function runLanguageModelTest({
  provider,
  secret,
  model,
  baseUrl,
  fetchImpl,
  signal,
}: {
  provider: AiProviderId;
  secret: string;
  model: string;
  baseUrl?: string;
  fetchImpl: typeof fetch;
  signal: AbortSignal;
}) {
  const languageModel = createLanguageModel({
    provider,
    secret,
    model,
    baseUrl,
    fetchImpl,
  });

  await generateText({
    model: languageModel,
    prompt: "Reply with the single word OK.",
    maxOutputTokens: 8,
    temperature: 0,
    maxRetries: 0,
    abortSignal: signal,
  });
}

function createLanguageModel({
  provider,
  secret,
  model,
  baseUrl,
  fetchImpl,
}: {
  provider: AiProviderId;
  secret: string;
  model: string;
  baseUrl?: string;
  fetchImpl: typeof fetch;
}): LanguageModel {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey: secret, fetch: fetchImpl }).chat(model);
    case "anthropic":
      return createAnthropic({ apiKey: secret, fetch: fetchImpl })(model);
    case "google":
      return createGoogleGenerativeAI({ apiKey: secret, fetch: fetchImpl })(
        model,
      );
    case "groq":
      return createGroq({ apiKey: secret, fetch: fetchImpl })(model);
    case "openrouter":
      return createOpenRouter({
        apiKey: secret,
        fetch: fetchImpl,
        compatibility: "strict",
      }).chat(model);
    case "custom":
      return createOpenAICompatible({
        name: "custom",
        apiKey: secret,
        baseURL: normalizeBaseUrl(baseUrl ?? ""),
        fetch: fetchImpl,
      })(model);
    case "cloudflare":
      // Cloudflare Clef uses its REST adapter, not the AI SDK.
      throw new Error(
        "Cloudflare credentials are tested with the Clef adapter",
      );
  }
}

async function runCloudflareClefTest({
  secret,
  accountId,
  model,
  fetchImpl,
  signal,
}: {
  secret: string;
  accountId: string;
  model: string;
  fetchImpl: typeof fetch;
  signal: AbortSignal;
}) {
  const response = await fetchImpl(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
      accountId,
    )}/ai/run/${normalizeCloudflareModelPath(model)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildCloudflareClefRequest(
          {
            fieldQuestion: "What is your name?",
            fieldType: "text",
            answer: "Ada Lovelace",
            recentTurns: [],
          },
          model,
        ),
      ),
      signal,
      redirect: "manual",
    },
  );

  if (!response.ok) {
    throw new ProviderHttpError(response.status);
  }
}

class ProviderHttpError extends Error {
  constructor(readonly statusCode: number) {
    super("Provider request failed");
    this.name = "ProviderHttpError";
  }
}

class ProviderConfigurationError extends Error {
  constructor() {
    super("Provider configuration is invalid");
    this.name = "ProviderConfigurationError";
  }
}

function mapTestError(error: unknown): AiProviderTestErrorCode {
  if (error instanceof ProviderConfigurationError) {
    return "invalid_configuration";
  }

  if (error instanceof ProviderTestTimeoutError) {
    return "timeout";
  }

  const name = error instanceof Error ? error.name : "";
  if (name === "AbortError" || name === "TimeoutError") {
    return "timeout";
  }

  const statusCode = getStatusCode(error);
  if (statusCode !== undefined) {
    if (statusCode === 401) return "invalid_credentials";
    if (statusCode === 403) return "forbidden";
    if (statusCode === 404) return "not_found";
    if (statusCode === 408) return "timeout";
    if (statusCode === 429) return "rate_limited";
    if (statusCode >= 500) return "provider_error";
    if (statusCode >= 400 && statusCode < 500) return "provider_error";
  }

  // Network failures surface as TypeError("fetch failed") from undici.
  if (error instanceof TypeError) {
    return "network_error";
  }

  return "provider_error";
}

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const statusCode = (error as { statusCode?: unknown }).statusCode;
  if (typeof statusCode === "number") {
    return statusCode;
  }

  const response = (error as { response?: unknown }).response;
  if (typeof response === "object" && response !== null) {
    const responseStatus = (response as { status?: unknown }).status;
    if (typeof responseStatus === "number") {
      return responseStatus;
    }
  }

  return undefined;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

/**
 * Cloudflare model ids look like `@cf/cloudflare/clef-flash`. Keep the `@` and
 * slashes readable, but never allow a path traversal segment.
 */
function normalizeCloudflareModelPath(model: string): string {
  const segments = model.split("/");
  if (
    !model ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        !/^[A-Za-z0-9@._-]+$/.test(segment),
    )
  ) {
    throw new ProviderConfigurationError();
  }

  return segments.join("/");
}
async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new ProviderTestTimeoutError());
    }, timeoutMs);
  });

  try {
    return await Promise.race([run(controller.signal), timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
