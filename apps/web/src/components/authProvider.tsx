import { ClerkProvider } from "@clerk/nextjs";

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
      {children}
    </ClerkProvider>
  );
}
