import { sendEmail } from "@convoform/email";

export async function sendWebhookDisabledEmail({
  to,
  formName,
}: {
  to: string;
  formName: string;
}) {
  const safeFormName = escapeHtml(formName);

  await sendEmail({
    to,
    subject: `Webhook disabled for ${formName}`,
    html: `
      <p>ConvoForm disabled a webhook endpoint for <strong>${safeFormName}</strong> after 10 consecutive failed deliveries.</p>
      <p>Re-enable it from the form's Webhooks settings once the destination is healthy again.</p>
    `,
    text: `ConvoForm disabled a webhook endpoint for ${formName} after 10 consecutive failed deliveries. Re-enable it from the form's Webhooks settings once the destination is healthy again.`,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
