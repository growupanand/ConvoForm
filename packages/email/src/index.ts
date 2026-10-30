import { render } from "@react-email/render";
import { CONTINUE_ON_DESKTOP_SUBJECT } from "./continueOnDesktop";
import { ResendProvider } from "./providers/resend";
import { ContinueOnDesktopEmail } from "./templates/continue-on-desktop-email";
import {
  FormResponseEmail,
  type FormResponseEmailProps,
} from "./templates/form-response-email";
import type { SendEmailOptions } from "./types";

export * from "./types";
export * from "./providers/resend";
export * from "./env";

const emailProvider = new ResendProvider();

export async function sendEmail(options: SendEmailOptions) {
  return emailProvider.sendEmail(options);
}

export async function sendFormResponseEmail({
  to,
  formName,
  responseId,
  respondentEmail,
  currentFieldResponses,
  transcript,
  metadata,
  responseLink,
}: FormResponseEmailProps & { to: string }) {
  const subject = `New response for ${formName}`;

  const html = await render(
    FormResponseEmail({
      formName,
      responseId,
      respondentEmail: respondentEmail ?? to,
      responseLink,
      currentFieldResponses,
      transcript,
      metadata,
    }),
  );

  await sendEmail({
    to,
    subject,
    html,
  });
}

export async function sendContinueOnDesktopEmail({ to }: { to: string }) {
  const html = await render(ContinueOnDesktopEmail());

  await sendEmail({
    to,
    subject: CONTINUE_ON_DESKTOP_SUBJECT,
    html,
  });
}
