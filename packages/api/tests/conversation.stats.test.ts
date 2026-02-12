import { beforeEach, describe, expect, it, mock } from "bun:test";
import { conversationRouter } from "../src/router/conversation";

describe("conversationRouter.stats", () => {
  const mockOrganizationId = "org_123";
  const mockUserId = "user_123";

  let mockDb: any;
  let mockCtx: any;

  beforeEach(() => {
    mockDb = {
      select: mock().mockReturnThis(),
      from: mock().mockReturnThis(),
      where: mock().mockReturnThis(),
    };

    mockCtx = {
      db: mockDb,
      auth: {
        userId: mockUserId,
        orgId: mockOrganizationId,
      },
      orgId: mockOrganizationId,
      user: {
        primaryEmailAddress: {
          emailAddress: "test@example.com",
        },
      },
    };
  });

  it("should return correct conversation stats", async () => {
    const mockStatsResult = {
      totalCount: 10,
      finishedTotalCount: 5,
      liveTotalCount: 3,
      partialTotalCount: 2,
      totalFinishTime: 250000,
      bouncedCount: 4,
    };

    mockDb.select.mockReturnValue({
      from: mock().mockReturnValue({
        where: mock().mockImplementation((_filters: any) => {
          return Promise.resolve([mockStatsResult]);
        }),
      }),
    });

    const caller = conversationRouter.createCaller(mockCtx);
    const result = await caller.stats({});

    expect(result.totalCount).toBe(10);
    expect(result.finishedTotalCount).toBe(5);
    expect(result.liveTotalCount).toBe(3);
    expect(result.partialTotalCount).toBe(2);
    expect(result.averageFinishTimeMs).toBe(50000);
    expect(result.bouncedCount).toBe(4);
    expect(result.bounceRate).toBe(40);
  });
});
