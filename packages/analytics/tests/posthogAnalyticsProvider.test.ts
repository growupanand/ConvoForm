import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const captureMock = mock();
const flushMock = mock(() => Promise.resolve());

mock.module("posthog-node", () => ({
  PostHog: class MockPostHog {
    capture = captureMock;
    flush = flushMock;
    identify = mock();
    captureException = mock();
  },
}));

describe("PosthogAnalyticsProvider", () => {
  beforeEach(() => {
    captureMock.mockClear();
    flushMock.mockClear();
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = undefined;
    process.env.NEXT_PUBLIC_POSTHOG_HOST = undefined;
  });

  it("awaits flush after capture with explicit distinctId", async () => {
    const { PosthogAnalyticsProvider } = await import(
      "../src/providers/posthogAnalyticsProvider"
    );
    const provider = new PosthogAnalyticsProvider();

    await provider.track("user:create", {
      distinctId: "user_clerk_abc",
      properties: {
        email: "growupanand@gmail.com",
        userId: "user_clerk_abc",
        method: "email",
      },
    });

    expect(captureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user_clerk_abc",
        event: "user:create",
      }),
    );
    expect(flushMock).toHaveBeenCalled();
  });
});
