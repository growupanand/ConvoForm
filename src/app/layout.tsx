import type { Metadata } from "next";

import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";

import GoogleAnalytics from "@/components/googleAnalytics";
import { SentryUserInit } from "@/components/sentryUserInit";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { roboto } from "./fonts";

export const metadata: Metadata = {
  title:
    "Bring Your Forms to Life with ConvoForm's Fascinating Conversational Style",
  description:
    "Transform your standard forms into engaging conversations with ConvoForm. Our easy-to-use, secure, and responsive form builder makes data collection more interactive. Try our free plan for unlimited form creation.",
  applicationName: "ConvoForm",
  authors: [
    {
      name: "Utkarsh Anand",
      url: "https://www.linkedin.com/in/utkarshanand93/",
    },
  ],
  keywords: [
    "ConvoForm",
    "AI Powered Conversational Forms",
    "Interactive Forms",
    "Form Builder",
    "Responsive Form Design",
    "Secure Data Collection",
    "OpenAI",
    "GPT3",
    "Alternative to Google Forms",
    "Easy Form Creation",
    "Free Form Builder",
    "Artificial Intelligence in Forms",
    "Data Collection Tool",
    "Customized Form Design",
  ],
  creator: "Utkarsh Anand",
  openGraph: {
    title:
      "Bring Your Forms to Life with ConvoForm's Fascinating Conversational Style",
    description:
      "Transform your standard forms into engaging conversations with ConvoForm. Our easy-to-use, secure, and responsive form builder makes data collection more interactive. Try our free plan for unlimited form creation.",
    url: "https://convoform.com",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/register">
      <html lang="en">
        <body className={cn(roboto.className, "bg-gray-50")}>
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
            <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
          ) : null}
          <SentryUserInit />

          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
