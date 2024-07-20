import type { Metadata } from "next";

import "../globals.css";
import "nprogress/nprogress.css";

import { Toaster as SonnerToaster } from "@convoform/ui/components/ui/sonner";
import { Toaster } from "@convoform/ui/components/ui/toaster";
import type { Viewport } from "next";

import { AuthProvider } from "@/components/authProvider";
import { Analytics } from "@/components/googleAnalytics";
import { TestAnaylytics } from "@/components/testAnalytics";
import { TRPCReactProvider } from "@/trpc/react";
import { TooltipProvider } from "@convoform/ui/components/ui/tooltip";
import { roboto } from "./fonts";

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
      <Analytics />

      <body className={roboto.className}>
        <TRPCReactProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              <TestAnaylytics />
              {children}
            </TooltipProvider>
          </AuthProvider>
        </TRPCReactProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
