import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Resend } from "resend";

process.env.RESEND_API_KEY = "test_key";
process.env.EMAIL_FROM = "test@example.com";

const sendMock = mock(() =>
  Promise.resolve({ data: { id: "email_123" }, error: null }),
);

const { ResendEmailError, ResendProvider } = await import("./resend");

function createProvider() {
  return new ResendProvider({
    emails: { send: sendMock },
  } as unknown as Resend);
}

describe("ResendProvider", () => {
  beforeEach(() => {
    sendMock.mockClear();
  });

  it("sends an email and logs the Resend email id", async () => {
    const provider = createProvider();

    await provider.sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(sendMock).toHaveBeenCalledWith({
      from: "test@example.com",
      to: "user@example.com",
      subject: "Test",
      html: "<p>Test</p>",
      text: undefined,
    });
  });

  it("throws when Resend returns an error instead of throwing", async () => {
    sendMock.mockImplementationOnce(() =>
      Promise.resolve({
        data: null,
        error: {
          name: "validation_error",
          message: "Invalid `to` field: user@example.com",
          statusCode: 422,
        },
      }),
    );

    const provider = createProvider();

    let thrown: unknown;
    try {
      await provider.sendEmail({
        to: "user@example.com",
        subject: "New response for Contact form",
        html: "<p>Secret transcript</p>",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ResendEmailError);
    expect((thrown as Error).message).toContain("validation_error");
    expect((thrown as Error).message).toContain("422");
    expect((thrown as Error).message).not.toContain("user@example.com");
    expect((thrown as Error).message).not.toContain("Contact form");
    expect((thrown as Error).message).not.toContain("Secret transcript");
    expect(thrown).toMatchObject({
      emailId: null,
      errorName: "validation_error",
      statusCode: 422,
      recipientCount: 1,
    });
  });
});
