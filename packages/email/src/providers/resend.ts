import { createLogger } from "@convoform/logger";
import { Resend } from "resend";
import { env } from "../env";

import type { EmailProvider, SendEmailOptions } from "../types";

type ResendEmailErrorDetails = {
  emailId: string | null;
  errorName: string;
  statusCode: number | null;
  recipientCount: number;
};

/**
 * Safe, PII-free error raised when Resend rejects an email request.
 *
 * The provider error message can echo recipient addresses, subjects or message
 * content, so only the error name and status code are kept.
 */
export class ResendEmailError extends Error {
  readonly emailId: string | null;
  readonly errorName: string;
  readonly statusCode: number | null;
  readonly recipientCount: number;

  constructor({
    emailId,
    errorName,
    statusCode,
    recipientCount,
  }: ResendEmailErrorDetails) {
    super(
      `Resend rejected the email request (${errorName}, status ${
        statusCode ?? "unknown"
      })`,
    );
    this.name = "ResendEmailError";
    this.emailId = emailId;
    this.errorName = errorName;
    this.statusCode = statusCode;
    this.recipientCount = recipientCount;
  }
}

export class ResendProvider implements EmailProvider {
  private resend: Resend;
  private logger = createLogger({
    console: { enabled: true },
    axiom: {
      enabled: !!env.AXIOM_TOKEN,
      token: env.AXIOM_TOKEN || "",
      dataset: env.AXIOM_DATASET || "",
    },
  });

  constructor(resend?: Resend) {
    if (!env.RESEND_API_KEY) {
      this.logger.warn(
        "RESEND_API_KEY is not set. Email functionality may not work.",
      );
    }
    this.resend = resend ?? new Resend(env.RESEND_API_KEY || "re_123");
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!env.EMAIL_FROM) {
      this.logger.error("EMAIL_FROM environment variable is not set");
      throw new Error("EMAIL_FROM environment variable is not set");
    }

    const recipientCount = Array.isArray(options.to) ? options.to.length : 1;

    try {
      this.logger.info("Sending email via Resend", { recipientCount });
      const response = await this.resend.emails.send({
        from: options.from || env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (response.error) {
        const error = new ResendEmailError({
          emailId: null,
          errorName: response.error.name,
          statusCode: response.error.statusCode,
          recipientCount,
        });

        this.logger.error("Resend rejected the email request", {
          emailId: error.emailId,
          errorName: error.errorName,
          statusCode: error.statusCode,
          recipientCount,
        });

        throw error;
      }

      this.logger.info("Email sent via Resend", {
        emailId: response.data.id,
        recipientCount,
      });
    } catch (error) {
      if (!(error instanceof ResendEmailError)) {
        // Never log the recipient address, subject or email body.
        this.logger.error("Failed to send email via Resend", {
          errorName: error instanceof Error ? error.name : "UnknownError",
          recipientCount,
        });
      }
      throw error;
    }
  }
}
