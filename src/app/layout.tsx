import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { roboto } from "./fonts";
import GoogleAnalytics from "@/components/googleAnalytics";

export const metadata: Metadata = {
  title: "Convo Form - AI-Powered Conversational Forms",
  description:
    "Build engaging and interactive forms that are easy to fill and fun to answer.",
  applicationName: "Convo Form",
  authors: [
    {
      name: "Utkarsh Anand",
      url: "https://www.linkedin.com/in/utkarshanand93/",
    },
  ],
  keywords: [
    "convoform",
    "convo form",
    "convoform.com",
    "nextjs",
    "openai",
    "gpt3",
    "ai",
    "artificial intelligence",
    "forms",
    "form builder",
    "google forms alternative",
  ],
  creator: "Utkarsh Anand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/register">
      <html lang="en">
        <body className={roboto.className}>
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
            <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
          ) : null}

          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
