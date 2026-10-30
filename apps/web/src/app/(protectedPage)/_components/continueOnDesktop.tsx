"use client";

import { useClerk } from "@clerk/nextjs";
import { CONTINUE_ON_DESKTOP_URL } from "@convoform/email/continueOnDesktop";
import { Button, toast } from "@convoform/ui";
import { usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";

import BrandNameLink from "@/components/common/brandName";
import { api } from "@/trpc/react";

const RESEND_COOLDOWN_MS = 60_000;

const whatsAppHref = `https://wa.me/?text=${encodeURIComponent(CONTINUE_ON_DESKTOP_URL)}`;

export function ContinueOnDesktop() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const { signOut } = useClerk();
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [resendReady, setResendReady] = useState(false);

  const sendLink = api.email.sendContinueOnDesktop.useMutation({
    onSuccess: (result) => {
      setSentEmail(result.email);
      setResendReady(false);
    },
  });

  useEffect(() => {
    if (!sentEmail || resendReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendReady(true);
    }, RESEND_COOLDOWN_MS);

    return () => window.clearTimeout(timeoutId);
  }, [sentEmail, resendReady]);

  const emailLocked = sentEmail !== null && !resendReady;
  const buttonLabel = sendLink.isPending
    ? "Sending..."
    : emailLocked
      ? `Sent to ${sentEmail}`
      : "Email me a desktop link";

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(CONTINUE_ON_DESKTOP_URL);
      toast.success("Link copied");
      posthog.capture("mobileHandoff:linkCopied", { pathname });
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gray-100">
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-800">
            You're in! 🎉
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            ConvoForm's form builder works best on a laptop or desktop. We'll
            send you a link so you can pick up right where you left off.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              className="!h-auto !whitespace-normal w-full break-all px-4 py-3"
              disabled={sendLink.isPending || emailLocked}
              onClick={() => sendLink.mutate()}
            >
              {buttonLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                void handleCopyLink();
              }}
            >
              Copy link
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  posthog.capture("mobileHandoff:whatsappShared", {
                    pathname,
                  });
                }}
              >
                Share on WhatsApp
              </a>
            </Button>
          </div>
          <Button
            type="button"
            variant="link"
            className="mt-4"
            onClick={() => {
              void signOut({ redirectUrl: "/" });
            }}
          >
            Sign out
          </Button>
          <div className="mt-6 flex justify-center">
            <BrandNameLink />
          </div>
        </div>
      </div>
    </div>
  );
}
