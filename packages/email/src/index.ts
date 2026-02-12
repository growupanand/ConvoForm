import { ResendProvider } from "./providers/resend";
import type { SendEmailOptions } from "./types";

export * from "./types";
export * from "./providers/resend";

const emailProvider = new ResendProvider();

export async function sendEmail(options: SendEmailOptions) {
  return emailProvider.sendEmail(options);
}

export async function sendFormResponseEmail({
  to,
  formName,
  responseId,
  respondentEmail,
}: {
  to: string;
  formName: string;
  responseId: string;
  respondentEmail?: string;
}) {
  const subject = `New response for ${formName}`;
  const html = `
    <h1>New Form Response</h1>
    <p>You have received a new response for your form <strong>${formName}</strong>.</p>
    <p>Response ID: ${responseId}</p>
    ${respondentEmail ? `<p>Respondent: ${respondentEmail}</p>` : ""}
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/forms/${responseId}">View Response</a></p>
  `;

  await sendEmail({
    to,
    subject,
    html,
  });
}
