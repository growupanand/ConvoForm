import { Toaster } from "@convoform/ui/src/components/ui/toast";
import { TooltipProvider } from "@convoform/ui/src/components/ui/tooltip";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type { Viewport } from "next";
import Script from "next/script";
import "@convoform/tailwind-config/src/globals.css";
import "nprogress/nprogress.css";
import { CSPostHogProvider } from "@/components/analytics/analyticsProvider";
import { GoogleAuthProvider } from "@/contexts/GoogleAuthContext";
import { cn } from "@/lib/utils";
// TODO: Disabled because getting some unexpected transitions when switching any page
// import { unstable_ViewTransition as ViewTransition } from "react";
import { bricolageGrotesque, inter, jetBrainsMono } from "./fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
    "AI conversational forms",
    "Conversational forms",
    "Interactive Forms",
    "Form Builder",
    "Responsive Form Design",
    "Secure Data Collection",
    "Alternative to Google Forms",
    "Easy Form Creation",
    "Free Form Builder",
    "Artificial Intelligence in Forms",
    "Data Collection Tool",
    "Customized Form Design",
    "Convo Form",
  ],
  creator: "Utkarsh Anand",
  twitter: {
    card: "summary_large_image",
    title: {
      default: "ConvoForm | AI Powered Conversational Forms",
      template: "%s | ConvoForm",
    },
    description:
      "Transform your standard forms into engaging conversations with ConvoForm. Our easy-to-use, secure, and responsive form builder makes data collection more interactive.",
  },
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
    // <ViewTransition>
    <html
      lang="en"
      className={cn(
        GeistSans.variable,
        bricolageGrotesque.variable,
        inter.variable,
        jetBrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script>{`document.documentElement.dataset.js = "1";
try {
  if (new URLSearchParams(window.location.search).get("static") === "1") {
    document.documentElement.dataset.static = "1";
  }
} catch {}`}</script>
      </head>
      <body className="antialiased font-sans bg-background">
        <CSPostHogProvider>
          <TooltipProvider delayDuration={200}>
            <GoogleAuthProvider>{children}</GoogleAuthProvider>
          </TooltipProvider>

          <Toaster />
        </CSPostHogProvider>
        <Script
          src="https://sponsoranysite.com/embed.js"
          data-site="JtOfXI-4o5np"
          strategy="afterInteractive"
        />
      </body>
    </html>
    // </ViewTransition>
  );
}
