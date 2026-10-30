import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { enforceRateLimit } from "@convoform/rate-limiter";

import {
  continueOnDesktopDelivery,
  readPrimaryEmail,
  sendContinueOnDesktopLink,
} from "../src/actions/email/sendContinueOnDesktopLink";

const track = mock(() => Promise.resolve());
const limit = spyOn(enforceRateLimit, "DESKTOP_HANDOFF");
const send = spyOn(continueOnDesktopDelivery, "send");

const account = {
  primaryEmailAddress: { emailAddress: "owner@example.com" },
  emailAddresses: [
    { emailAddress: "owner@example.com" },
    { emailAddress: "other@example.com" },
  ],
};

describe("readPrimaryEmail", () => {
  it("uses the account primary address", () => {
    expect(readPrimaryEmail(account)).toBe("owner@example.com");
  });

  it("falls back to the first address on the account", () => {
    expect(
      readPrimaryEmail({
        primaryEmailAddress: null,
        emailAddresses: [{ emailAddress: "fallback@example.com" }],
      }),
    ).toBe("fallback@example.com");
  });

  it("returns nothing when the account has no address", () => {
    expect(
      readPrimaryEmail({
        primaryEmailAddress: null,
        emailAddresses: [],
      }),
    ).toBeUndefined();
  });
});

describe("sendContinueOnDesktopLink", () => {
  beforeEach(() => {
    track.mockClear();
    limit.mockReset();
    send.mockReset();
    limit.mockResolvedValue(undefined);
    send.mockResolvedValue(undefined);
  });

  afterAll(() => {
    limit.mockRestore();
    send.mockRestore();
  });

  it("emails the signed-in account and records the handoff", async () => {
    const result = await sendContinueOnDesktopLink({
      userId: "user_clerk_1",
      orgId: "org_1",
      user: account,
      analytics: { track },
    });

    expect(result).toEqual({ email: "owner@example.com" });
    expect(limit).toHaveBeenCalledWith("user_clerk_1");
    expect(send).toHaveBeenCalledWith({ to: "owner@example.com" });
    expect(track).toHaveBeenCalledWith("mobileHandoff:emailSent", {
      distinctId: "user_clerk_1",
      properties: { userId: "user_clerk_1" },
      groups: { organization: "org_1" },
    });
  });

  it("does not email another address when the account has none", async () => {
    await expect(
      sendContinueOnDesktopLink({
        userId: "user_clerk_1",
        orgId: null,
        user: { primaryEmailAddress: null, emailAddresses: [] },
        analytics: { track },
      }),
    ).rejects.toThrow("Your account does not have an email address.");

    expect(limit).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("does not send when the daily limit is already used", async () => {
    limit.mockRejectedValueOnce(new Error("limited"));

    await expect(
      sendContinueOnDesktopLink({
        userId: "user_clerk_1",
        orgId: "org_1",
        user: account,
        analytics: { track },
      }),
    ).rejects.toThrow("limited");

    expect(send).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
