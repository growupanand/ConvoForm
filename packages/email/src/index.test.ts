import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const sendMock = mock(() => Promise.resolve());

const fakeProvider = {
  sendEmail: sendMock,
};

describe("Email Package", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: "test_key",
      EMAIL_FROM: "test@example.com",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };
    sendMock.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should send email using the email provider", async () => {
    const { sendEmail } = await import("./index");
    await sendEmail(
      {
        to: "user@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      },
      fakeProvider,
    );

    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("should send form response email", async () => {
    const { sendFormResponseEmail } = await import("./index");
    await sendFormResponseEmail(
      {
        to: "user@example.com",
        formName: "Test Form",
        responseId: "response-123",
        respondentEmail: "respondent@example.com",
      },
      fakeProvider,
    );

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0]?.[0]).toMatchObject({
      to: "user@example.com",
      subject: "New response for Test Form",
    });
  });
});
