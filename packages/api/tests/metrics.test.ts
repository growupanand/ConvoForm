import { beforeEach, describe, expect, it, mock } from "bun:test";
import { metricsRouter } from "../src/router/metrics";

describe("metricsRouter.getFormMetrics", () => {
  const mockOrganizationId = "org_123";
  const mockUserId = "user_123";

  let mockDb: any;
  let mockCtx: any;

  beforeEach(() => {
    mockDb = {
      select: mock(),
    };

    mockCtx = {
      db: mockDb,
      auth: {
        userId: mockUserId,
        orgId: mockOrganizationId,
      },
      user: {
        primaryEmailAddress: {
          emailAddress: "test@example.com",
        },
      },
    };
  });

  it("should return correct form metrics", async () => {
    const mockGroupedData = [
      { day: 1, count: 2 },
      { day: 15, count: 1 },
    ];
    const day15 = new Date();
    day15.setDate(15);

    mockDb.select.mockImplementation((fields: any) => {
      const chain = {
        from: mock().mockReturnThis(),
        where: mock().mockReturnThis(),
        groupBy: mock().mockReturnThis(),
        orderBy: mock().mockReturnThis(),
        limit: mock().mockReturnThis(),
        // biome-ignore lint/suspicious/noThenProperty: Mocking a thenable interface for Drizzle
        then: (resolve: any) => {
          if (fields.day) {
            return Promise.resolve(mockGroupedData).then(resolve);
          }
          if (fields.createdAt) {
            return Promise.resolve([{ createdAt: day15 }]).then(resolve);
          }
          if (fields.value) {
            return Promise.resolve([{ value: 3 }]).then(resolve);
          }
          return Promise.resolve([]).then(resolve);
        },
      };
      return chain;
    });

    const caller = metricsRouter.createCaller(mockCtx);
    const result = await caller.getFormMetrics({
      organizationId: mockOrganizationId,
    });

    expect(result.totalCount).toBe(3);
    expect(result.lastCreatedAt).toEqual(day15);

    const day1Entry = result.data.find((d) => d.name === "1");
    const day15Entry = result.data.find((d) => d.name === "15");
    const day2Entry = result.data.find((d) => d.name === "2");

    expect(day1Entry?.count).toBe(2);
    expect(day15Entry?.count).toBe(1);
    expect(day2Entry?.count).toBe(0);
  });
});
