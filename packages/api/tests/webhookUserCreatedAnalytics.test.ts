import { beforeEach, describe, expect, it, mock } from "bun:test";

const trackMock = mock(() => Promise.resolve());

mock.module("@convoform/db/src/env", () => ({
  env: { DATABASE_URL: "postgresql://localhost/test" },
  databaseEnvSchema: {},
}));

mock.module("@convoform/analytics", () => ({
  analytics: {
    track: trackMock,
    alias: mock(),
  },
}));

describe("webhook userCreated analytics", () => {
  beforeEach(() => {
    trackMock.mockClear();
  });

  it("tracks user:create with Clerk distinct id and signup method without alias", async () => {
    const { handleUserCreated } = await import(
      "../src/actions/webhook/clerkWebhook"
    );

    const insertMock = mock().mockReturnValue({
      values: mock().mockReturnValue({
        returning: mock(() =>
          Promise.resolve([
            {
              id: "db_cuid",
              userId: "user_clerk_1",
              email: "new@example.com",
              firstName: "New",
              lastName: "User",
            },
          ]),
        ),
      }),
    });

    await handleUserCreated(
      {
        email: "new@example.com",
        firstName: "New",
        lastName: "User",
        userId: "user_clerk_1",
        imageUrl: null,
        signupMethod: "google",
      },
      { db: { insert: insertMock } as any },
    );

    expect(trackMock).toHaveBeenCalledWith("user:create", {
      distinctId: "user_clerk_1",
      properties: expect.objectContaining({
        userId: "user_clerk_1",
        method: "google",
      }),
    });
  });
});
