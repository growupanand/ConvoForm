import { afterEach, beforeEach, describe, it, mock } from "bun:test";

// Mock Resend
mock.module("resend", () => {
  return {
    Resend: class {
      emails = {
        send: mock(() => Promise.resolve({ id: "123" })),
      };
    },
  };
});

describe("Email Package", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: "test_key",
      EMAIL_FROM: "test@example.com",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    mock.restore();
  });

  it("should send email using ResendProvider", async () => {
    const { sendEmail } = await import("./index");
    await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });
  });

  it("should send form response email", async () => {
    const { sendFormResponseEmail } = await import("./index");
    await sendFormResponseEmail({
      to: "user@example.com",
      formName: "Test Form",
      responseId: "response-123",
      respondentEmail: "respondent@example.com",
    });
  });
});
