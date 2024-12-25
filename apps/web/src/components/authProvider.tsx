import { ClerkProvider } from "@clerk/nextjs";

import { PosthogUserInit } from "./posthogUserInit";
import { SentryUserInit } from "./sentryUserInit";

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/register"
    >
      <SentryUserInit />
      <PosthogUserInit />
      {children}
    </ClerkProvider>
  );
}
