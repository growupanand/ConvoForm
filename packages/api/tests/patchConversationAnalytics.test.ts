import { beforeEach, describe, expect, it, mock } from "bun:test";

const trackMock = mock(() => Promise.resolve());

mock.module("@convoform/db/src/env", () => ({
  env: { DATABASE_URL: "postgresql://localhost/test" },
  databaseEnvSchema: {},
}));

mock.module("@convoform/analytics", () => ({
  analytics: {
    track: trackMock,
  },
}));

mock.module("../src/lib/trpc-client", () => ({
  trpcFetchClient: {
    integration: { sync: { mutate: mock() } },
    email: { sendFormResponse: { mutate: mock() } },
  },
}));

mock.module("../src/env", () => ({
  env: { INTERNAL_EMAIL_API_SECRET: "secret" },
}));

describe("patchConversation analytics", () => {
  beforeEach(() => {
    trackMock.mockClear();
  });

  it("emits conversation:complete once for the form owner on first finish", async () => {
    const { patchConversation } = await import(
      "../src/actions/conversation/patchConversation"
    );

    const finishedAt = new Date();
    const existingRow = {
      finishedAt: null as Date | null,
      metaData: { isOwnerPreview: true },
    };

    const updatedRow = {
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt,
      metaData: { isOwnerPreview: true },
      transcript: [],
      formFieldResponses: [],
    };

    const mockTx = {
      execute: mock(() => Promise.resolve()),
      query: {
        conversation: {
          findFirst: mock(() => Promise.resolve(existingRow)),
        },
      },
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock(() => Promise.resolve([updatedRow])),
          }),
        }),
      }),
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          innerJoin: mock().mockReturnValue({
            where: mock().mockReturnValue({
              limit: mock(() =>
                Promise.resolve([
                  {
                    userEmail: "owner@example.com",
                    formName: "Form",
                  },
                ]),
              ),
            }),
          }),
        }),
      }),
    };

    const mockDb = {
      transaction: mock((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };

    await patchConversation(
      {
        id: "conv_1",
        finishedAt,
      } as any,
      { db: mockDb as any },
    );

    expect(trackMock).toHaveBeenCalledWith(
      "conversation:update",
      expect.any(Object),
    );
    expect(trackMock).toHaveBeenCalledWith("conversation:complete", {
      distinctId: "conv_1",
      groups: { organization: "org_1" },
      properties: expect.objectContaining({
        formId: "form_1",
        conversationId: "conv_1",
        isOwnerPreview: true,
      }),
    });
    expect(trackMock.mock.calls.length).toBe(2);
  });
});
