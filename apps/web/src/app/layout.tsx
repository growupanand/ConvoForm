import type { Metadata } from "next";

import "../globals.css";
import "nprogress/nprogress.css";

import { Toaster as SonnerToaster } from "@convoform/ui/components/ui/sonner";
import { Toaster } from "@convoform/ui/components/ui/toaster";
import { TooltipProvider } from "@convoform/ui/components/ui/tooltip";
import type { Viewport } from "next";

import GoogleAnalytics from "@/components/googleAnalytics";
import { roboto } from "./fonts";
import { TRPCReactProvider } from "@/trpc/react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.convoform.com"),
  title: {
    default: "ConvoForm | AI Powered Conversational Forms",
    template: "%s | ConvoForm",
  },
  description:
    "Transform your standard forms into engaging conversations with ConvoForm. Our easy-to-use, secure, and responsive form builder makes data collection more interactive.",
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
    "Convo Form",
  ],
  creator: "Utkarsh Anand",
  openGraph: {
    title: {
      default: "ConvoForm | AI Powered Conversational Forms",
      template: "%s | ConvoForm",
    },
    description:
      "Transform your standard forms into engaging conversations with ConvoForm. Our easy-to-use, secure, and responsive form builder makes data collection more interactive.",
    url: "https://www.convoform.com",
    type: "website",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}

        <TooltipProvider delayDuration={200}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </TooltipProvider>

        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
