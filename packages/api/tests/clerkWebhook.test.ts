import { beforeEach, describe, expect, it, mock } from "bun:test";

const eqMock = mock((column: unknown, value: unknown) => ({ column, value }));
const trackMock = mock(() => Promise.resolve());

mock.module("@convoform/db", () => ({
  eq: eqMock,
}));

mock.module("@convoform/analytics", () => ({
  analytics: {
    track: trackMock,
    alias: mock(),
  },
}));

const { handleOrganizationDeleted, handleUserCreated, handleUserDeleted } =
  await import("../src/actions/webhook/clerkWebhook");
const {
  aiProviderCredential,
  organization,
  organizationAiSettings,
  organizationMember,
  user,
} = await import("@convoform/db/src/schema");

describe("Clerk webhook handlers", () => {
  beforeEach(() => {
    eqMock.mockClear();
    trackMock.mockClear();
  });

  it("deletes organization AI data before the organization in one transaction", async () => {
    const deletedTables: unknown[] = [];
    const deleteMock = mock((table: unknown) => {
      deletedTables.push(table);
      return {
        where: mock(() => ({
          returning: mock(async () =>
            table === organization ? [{ organizationId: "org_clerk_1" }] : [],
          ),
        })),
      };
    });
    const transaction = mock(async (callback: (tx: unknown) => unknown) =>
      callback({ delete: deleteMock }),
    );

    await handleOrganizationDeleted(
      { organizationId: "org_clerk_1" },
      { db: { transaction } as any },
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    // Settings reference credentials, so they must be deleted first. Audit
    // rows are deliberately never deleted here.
    expect(deletedTables).toEqual([
      organizationAiSettings,
      aiProviderCredential,
      organizationMember,
      organization,
    ]);
    expect(trackMock).toHaveBeenCalledWith("organization:delete", {
      properties: { organizationId: "org_clerk_1" },
    });
  });

  it("deletes users by Clerk userId, not the internal row id", async () => {
    const returning = mock(() =>
      Promise.resolve([{ id: "db_user_1", userId: "user_clerk_1" }]),
    );
    const where = mock(() => ({ returning }));
    const deleteMock = mock(() => ({ where }));

    await handleUserDeleted(
      { userId: "user_clerk_1" },
      { db: { delete: deleteMock } as any },
    );

    expect(eqMock).toHaveBeenCalledWith(user.userId, "user_clerk_1");
    expect(trackMock).toHaveBeenCalledWith("user:delete", {
      distinctId: "user_clerk_1",
      properties: { id: "db_user_1", userId: "user_clerk_1" },
    });
  });

  it("rethrows non-duplicate database errors so Clerk retries", async () => {
    const returning = mock(() => Promise.reject(new Error("database down")));
    const values = mock(() => ({ returning }));
    const insert = mock(() => ({ values }));

    await expect(
      handleUserCreated(
        {
          email: "new@example.com",
          firstName: "New",
          lastName: "User",
          userId: "user_clerk_1",
          imageUrl: null,
        },
        { db: { insert } as any },
      ),
    ).rejects.toThrow("database down");
  });

  it("acknowledges duplicate inserts", async () => {
    const duplicateError = Object.assign(new Error("duplicate"), {
      code: "23505",
    });
    const returning = mock(() => Promise.reject(duplicateError));
    const values = mock(() => ({ returning }));
    const insert = mock(() => ({ values }));

    await expect(
      handleUserCreated(
        {
          email: "new@example.com",
          firstName: "New",
          lastName: "User",
          userId: "user_clerk_1",
          imageUrl: null,
        },
        { db: { insert } as any },
      ),
    ).resolves.toBeUndefined();
  });

  it("logs only identifiers when a handler fails", async () => {
    const consoleErrorMock = mock(() => undefined);
    const originalConsoleError = console.error;
    console.error = consoleErrorMock;

    try {
      const returning = mock(() => Promise.reject(new Error("database down")));
      const values = mock(() => ({ returning }));
      const insert = mock(() => ({ values }));

      await expect(
        handleUserCreated(
          {
            email: "private@example.com",
            firstName: "Private",
            lastName: "Person",
            userId: "user_clerk_1",
            imageUrl: null,
          },
          { db: { insert } as any },
        ),
      ).rejects.toThrow("database down");
    } finally {
      console.error = originalConsoleError;
    }

    const logged = JSON.stringify(consoleErrorMock.mock.calls);
    expect(logged).toContain("user_clerk_1");
    expect(logged).not.toContain("private@example.com");
    expect(logged).not.toContain("Private");
  });
});
