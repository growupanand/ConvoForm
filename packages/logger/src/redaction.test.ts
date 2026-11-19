import { afterEach, describe, expect, it } from "bun:test";
import { createLogger } from "../index";
import {
  REDACTED_VALUE,
  clearSensitiveValues,
  forgetSensitiveValue,
  redactSensitiveData,
  redactText,
  registerSensitiveValue,
} from "./redaction";

const fakeOpenAiKey = "sk-live-fake-key-1234567890abcdef";
const fakeAnthropicKey = "sk-ant-fake-key-1234567890abcdef";
const fakeGroqKey = "gsk_fakekey1234567890abcdef";

afterEach(() => {
  clearSensitiveValues();
});

describe("redactText", () => {
  it("redacts a registered secret wherever it appears", () => {
    registerSensitiveValue(fakeOpenAiKey);

    expect(redactText(`provider rejected ${fakeOpenAiKey}`)).toBe(
      `provider rejected ${REDACTED_VALUE}`,
    );
  });

  it("does not redact values that were forgotten", () => {
    const plainSecret = "provider-secret-1234567890";
    registerSensitiveValue(plainSecret);
    forgetSensitiveValue(plainSecret);

    expect(redactText(plainSecret)).toBe(plainSecret);
  });

  it("ignores very short values to avoid over-redacting", () => {
    registerSensitiveValue("short");
    expect(redactText("a short word")).toBe("a short word");
  });

  it("redacts well-known key shapes without registration", () => {
    expect(redactText(`key ${fakeOpenAiKey}`)).not.toContain(fakeOpenAiKey);
    expect(redactText(`key ${fakeAnthropicKey}`)).not.toContain(
      fakeAnthropicKey,
    );
    expect(redactText(`key ${fakeGroqKey}`)).not.toContain(fakeGroqKey);
    expect(
      redactText("AIza1234567890abcdefghijklmnopqrstuvwxyz"),
    ).not.toContain("AIza1234567890");
  });

  it("redacts bearer tokens and query parameters", () => {
    const redacted = redactText(
      "Authorization: Bearer abcdefghijklmnop api_key=supersecretvalue",
    );

    expect(redacted).not.toContain("abcdefghijklmnop");
    expect(redacted).not.toContain("supersecretvalue");
    expect(redacted).not.toContain("Bearer abc");
  });

  it("redacts credentials embedded in a URL", () => {
    const redacted = redactText("https://user:password@example.com/v1");

    expect(redacted).toBe(`https://${REDACTED_VALUE}@example.com/v1`);
  });
});

describe("redactSensitiveData", () => {
  it("redacts registered secrets in nested values", () => {
    registerSensitiveValue(fakeOpenAiKey);

    const redacted = redactSensitiveData({
      error: { cause: `bad key ${fakeOpenAiKey}` },
      list: [`prefix-${fakeOpenAiKey}`],
    });

    expect(JSON.stringify(redacted)).not.toContain(fakeOpenAiKey);
  });

  it("redacts fields whose names look sensitive", () => {
    const redacted = redactSensitiveData({
      apiKey: "anything",
      password: "anything",
      encryptedSecret: "anything",
      wrappedDataKey: "anything",
      safe: "visible",
    });

    expect(redacted).toEqual({
      apiKey: REDACTED_VALUE,
      password: REDACTED_VALUE,
      encryptedSecret: REDACTED_VALUE,
      wrappedDataKey: REDACTED_VALUE,
      safe: "visible",
    });
  });

  it("redacts errors and keeps only safe fields", () => {
    registerSensitiveValue(fakeOpenAiKey);

    const redacted = redactSensitiveData(
      new Error(`provider failed for ${fakeOpenAiKey}`),
    );

    expect(redacted).toEqual({
      name: "Error",
      message: `provider failed for ${REDACTED_VALUE}`,
      stack: expect.any(String),
    });
    expect(JSON.stringify(redacted)).not.toContain(fakeOpenAiKey);
  });

  it("does not recurse forever on cycles", () => {
    const context: Record<string, unknown> = { name: "cycle" };
    context.self = context;

    const redacted = redactSensitiveData(context);

    expect(redacted).toEqual({
      name: "cycle",
      self: REDACTED_VALUE,
    });
  });
});

describe("Logger redaction", () => {
  it("redacts a registered secret before it reaches the console", () => {
    registerSensitiveValue(fakeOpenAiKey);

    const logger = createLogger({
      level: "debug",
      console: { enabled: true },
      env: "test",
    });

    const originalLog = console.log;
    const captured: unknown[][] = [];
    console.log = (...args: unknown[]) => {
      captured.push(args);
    };

    try {
      logger.error(`Provider failed with ${fakeOpenAiKey}`, {
        nested: { apiKey: fakeOpenAiKey },
      });
    } finally {
      console.log = originalLog;
    }

    expect(captured.length).toBeGreaterThan(0);
    expect(JSON.stringify(captured)).not.toContain(fakeOpenAiKey);
  });
});
