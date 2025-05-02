import { ClerkProvider } from "@clerk/nextjs";

import { PosthogUserInit } from "./posthogUserInit";

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/register"
      appearance={{
        layout: {
          termsPageUrl: "/terms",
          privacyPageUrl: "/privacy",
          logoImageUrl: "/logo.png",
        },
      }}
    >
      <PosthogUserInit />
      {children}
    </ClerkProvider>
  );
}
