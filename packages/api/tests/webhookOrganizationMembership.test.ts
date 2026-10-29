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

type MembershipRow = {
  id: string;
  memberId: string;
  organizationId: string;
  userId: string;
  role: string;
};

function createDb(rows: MembershipRow[]) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => rows,
        }),
      }),
    }),
    insert: () => ({
      values: (values: Omit<MembershipRow, "id">) => ({
        returning: async () => {
          const created = { id: `row_${rows.length + 1}`, ...values };
          rows.push(created);
          return [created];
        },
      }),
    }),
  };
}

describe("webhook organizationMembershipCreated", () => {
  beforeEach(() => {
    trackMock.mockClear();
  });

  it("creates one OrganizationMember row when the webhook is delivered twice", async () => {
    const { webhookRouter } = await import("../src/router/webhook");
    const rows: MembershipRow[] = [];
    const caller = webhookRouter.createCaller({
      db: createDb(rows) as any,
      auth: {},
      user: null,
      headers: undefined,
      req: undefined,
      rawBody: undefined,
    });
    const input = {
      memberId: "orgmem_1",
      organizationId: "org_1",
      userId: "user_1",
      role: "org:admin",
    };

    await caller.organizationMembershipCreated(input);
    await caller.organizationMembershipCreated(input);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject(input);
    expect(trackMock).toHaveBeenCalledTimes(1);
  });
});
