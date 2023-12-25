import LoginCard from "@/components/loginCard";
import { getProviders } from "next-auth/react";
import { getCsrfToken } from "next-auth/react";

export default async function LoginPage() {
  let providers = await getProviders();
  const csrfToken = await getCsrfToken();

  if (!providers || Object.keys(providers).length === 0) {
    return (
      <div className="container mx-auto px-4">
        Currently app is not configured to support any login providers.
      </div>
    );
  }

  return <LoginCard providers={providers} csrfToken={csrfToken} />;
}
