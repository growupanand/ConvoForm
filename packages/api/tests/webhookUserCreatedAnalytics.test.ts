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
    const { webhookRouter } = await import("../src/router/webhook");

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

    const caller = webhookRouter.createCaller({
      db: { insert: insertMock } as any,
      auth: {},
      user: null,
      headers: undefined,
      req: undefined,
      rawBody: undefined,
    });

    await caller.userCreated({
      email: "new@example.com",
      firstName: "New",
      lastName: "User",
      userId: "user_clerk_1",
      imageUrl: null,
      signupMethod: "google",
    });

    expect(trackMock).toHaveBeenCalledWith("user:create", {
      distinctId: "user_clerk_1",
      properties: expect.objectContaining({
        userId: "user_clerk_1",
        method: "google",
      }),
    });
  });
});
