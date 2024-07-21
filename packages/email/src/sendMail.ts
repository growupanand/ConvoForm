import { render } from "@react-email/render";

import WelcomeEmail from "./templates/welcomeTemplate";

interface EmailProps {
  name: string;
}
// Function to render the email as HTML
export const renderWelcomeEmail = (name: EmailProps) => {
  try {
    const htmlContent = render(WelcomeEmail(name), {
      pretty: true,
    });
    return htmlContent;
  } catch (error) {
    console.error("Error rendering email:", error);
    throw new Error("Failed to render email template.");
  }
};
