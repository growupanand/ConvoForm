export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
