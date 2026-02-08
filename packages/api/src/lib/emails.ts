import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface FormResponseEmailProps {
  to: string;
  formName: string;
  conversationName: string;
  responses: Array<{
    fieldName: string;
    fieldValue: string | null;
  }>;
  tldr?: string;
}

export async function sendFormResponseEmail({
  to,
  formName,
  conversationName,
  responses,
  tldr,
}: FormResponseEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping email.");
    return;
  }

  const responseHtml = responses
    .map(
      (r) => `
    <div style="margin-bottom: 15px;">
      <div style="font-weight: bold; color: #374151;">${r.fieldName}</div>
      <div style="color: #1f2937;">${r.fieldValue || "No response"}</div>
    </div>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; line-height: 1.5; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111827; margin-bottom: 8px;">New Response for ${formName}</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">Conversation: ${conversationName}</p>
        
        ${
          tldr
            ? `
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">AI Summary</h3>
            <p style="margin-bottom: 0;">${tldr}</p>
          </div>
        `
            : ""
        }

        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
          ${responseHtml}
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          Sent via ConvoForm
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "ConvoForm <notifications@convoform.com>",
      to,
      subject: `New Response: ${formName} - ${conversationName}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send form response email:", error);
  }
}
