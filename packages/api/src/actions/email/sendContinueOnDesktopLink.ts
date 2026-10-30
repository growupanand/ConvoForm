import { sendContinueOnDesktopEmail } from "@convoform/email";
import { enforceRateLimit } from "@convoform/rate-limiter";
import { TRPCError } from "@trpc/server";

export type AccountEmailSource = {
  primaryEmailAddress: { emailAddress: string } | null | undefined;
  emailAddresses: readonly { emailAddress: string }[];
};

type TrackDesktopHandoff = (
  eventName: "mobileHandoff:emailSent",
  details: {
    distinctId: string;
    properties?: Record<string, unknown>;
    groups?: { organization: string };
  },
) => Promise<void>;

export function readPrimaryEmail(user: AccountEmailSource): string | undefined {
  const primary = user.primaryEmailAddress?.emailAddress.trim();
  if (primary) {
    return primary;
  }

  const fallback = user.emailAddresses[0]?.emailAddress.trim();
  return fallback || undefined;
}

export const continueOnDesktopDelivery = {
  send(message: { to: string }) {
    return sendContinueOnDesktopEmail(message);
  },
};

/**
 * Emails a desktop link to the signed-in account. The address always comes
 * from that account, never from request input.
 */
export async function sendContinueOnDesktopLink(input: {
  userId: string;
  orgId?: string | null;
  user: AccountEmailSource;
  analytics: { track: TrackDesktopHandoff };
}) {
  const email = readPrimaryEmail(input.user);
  if (!email) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Your account does not have an email address.",
    });
  }

  await enforceRateLimit.DESKTOP_HANDOFF(input.userId);
  await continueOnDesktopDelivery.send({ to: email });

  await input.analytics.track("mobileHandoff:emailSent", {
    distinctId: input.userId,
    properties: { userId: input.userId },
    ...(input.orgId ? { groups: { organization: input.orgId } } : {}),
  });

  return { email };
}
