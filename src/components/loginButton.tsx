"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BuiltInProviderType } from "next-auth/providers/index";
import {
  signIn,
  getProviders,
  LiteralUnion,
  ClientSafeProvider,
} from "next-auth/react";
import { useEffect, useState } from "react";

type State = {
  isLoading: boolean;
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
};

export default function LoginButton() {
  const [state, setState] = useState<State>({
    isLoading: true,
    providers: null,
  });
  const { isLoading, providers } = state;

  useEffect(() => {
    (async () => {
      const providers = await getProviders();
      setState({
        isLoading: false,
        providers,
      });
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin h-5 w-5 text-gray-700" />
        Please wait...
      </div>
    );
  }

  if (!isLoading && (!providers || Object.keys(providers).length === 0)) {
    return <p>no providers</p>;
  }

  return (
    <>
      {Object.values(providers!).map((provider) => (
        <Button
          key={provider.id}
          className="w-full"
          onClick={() =>
            signIn(provider.id, {
              callbackUrl: "http://localhost:3000",
            })
          }
        >
          Login with {provider.name}
        </Button>
      ))}
    </>
  );
}
