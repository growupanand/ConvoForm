import { createLogger } from "@convoform/logger";
import { Resend } from "resend";

import type { EmailProvider, SendEmailOptions } from "../types";

export class ResendProvider implements EmailProvider {
  private resend: Resend;
  private logger = createLogger({
    console: { enabled: true },
    axiom: {
      enabled: !!process.env.AXIOM_TOKEN,
      token: process.env.AXIOM_TOKEN || "",
      dataset: process.env.AXIOM_DATASET || "",
    },
  });

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(
        "RESEND_API_KEY is not set. Email functionality may not work.",
      );
    }
    this.resend = new Resend(process.env.RESEND_API_KEY || "re_123");
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!process.env.EMAIL_FROM) {
      this.logger.error("EMAIL_FROM environment variable is not set");
      throw new Error("EMAIL_FROM environment variable is not set");
    }

    try {
      this.logger.info("Sending email via Resend", {
        to: options.to,
        subject: options.subject,
      });
      const response = await this.resend.emails.send({
        from: options.from || process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.info("Email sent via Resend", {
        response,
        to: options.to,
      });
    } catch (error) {
      this.logger.error("Failed to send email via Resend", {
        error,
        to: options.to,
      });
      throw error;
    }
  }
}
