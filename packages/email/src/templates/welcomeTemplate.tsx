import React from 'react'
import { Html } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

const WelcomeEmail= ({ name }: WelcomeEmailProps) => {
  return (
    <Html style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
      <h1>Welcome to Convoform, {name}!</h1>
      <p>We are thrilled to have you on board. Enjoy our services and have a great day!</p>
      <p>Best regards,</p>
      <p>The Convoform Team</p>
    </Html>
  );
};

export default WelcomeEmail;
