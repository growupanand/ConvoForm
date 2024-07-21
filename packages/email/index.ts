import { Resend } from "resend";

import { renderWelcomeEmail } from "./src/sendMail";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface EmailDetails {
  to: string;
  name: NameProps;
}

interface NameProps {
  name: string;
}

const canSendMail = (): boolean => {
  return Boolean(process.env.RESEND_API_KEY);
};

const sendMail = async ({ to, name }: EmailDetails) => {
  if (!canSendMail()) {
    console.warn("Resend API key is not configured. Skipping email send.");
    return;
  }
  try {
    const content = renderWelcomeEmail(name);

    const { id } = await resend.emails.send({
      from: `${process.env.SENDER_MAIL}`,
      to: [to],
      subject: "Welcome to Convoform!!!😊🎉",
      html: content,
    });

    if (id) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export default sendMail;
