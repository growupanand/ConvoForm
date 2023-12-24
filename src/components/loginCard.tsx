"use client";

import { Button } from "@/components/ui/button";
import { BuiltInProviderType } from "next-auth/providers/index";
import { signIn, LiteralUnion, ClientSafeProvider } from "next-auth/react";
import { Input } from "./ui/input";
import { z } from "zod";
import { userAuthSchema } from "@/lib/validations/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "./ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >;
  csrfToken?: string;
};

type State = {
  isLoading: boolean;
};

type FormData = z.infer<typeof userAuthSchema>;

export default function LoginCard({ providers, csrfToken }: Readonly<Props>) {
  const isEmailProviderAvailable = !!csrfToken && csrfToken !== "";

  const formHook = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const [state, setState] = useState<State>({
    isLoading: false,
  });
  const { isLoading } = state;

  async function onSubmit(data: FormData) {
    setState((cs) => ({ ...cs, isLoading: true }));

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setState((cs) => ({ ...cs, isLoading: false }));

    if (!signInResult?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      });
    }

    formHook.reset({
      email: "",
    });

    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

  const { email, ...otherProviders } = providers;

  const oAuthProviders = Object.values(otherProviders).filter(
    (provider) => provider.type === "oauth"
  );

  return (
    <div className="flex flex-col justify-between gap-4 h-full">
      <Form {...formHook}>
        <form onSubmit={formHook.handleSubmit(onSubmit)}>
          <input
            {...formHook.register("csrfToken", { value: csrfToken })}
            type="hidden"
          />
          <div className="grid gap-2">
            <FormField
              control={formHook.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="user@email.com"
                      {...field}
                      disabled={!isEmailProviderAvailable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEmailProviderAvailable && (
              <p className="text-destructive">
                Email login is currently unavailable.
              </p>
            )}
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading || !isEmailProviderAvailable}
            >
              Login with Email
            </Button>
          </div>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="space-y-1">
        {oAuthProviders.map((provider) => (
          <Button
            key={provider.id}
            variant="secondary"
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
      </div>
    </div>
  );
}
