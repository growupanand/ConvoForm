import { beforeEach, describe, expect, it, mock } from "bun:test";
import { conversationRouter } from "../src/router/conversation";

describe("conversationRouter stats extra", () => {
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
      orgId: mockOrganizationId,
      user: {
        primaryEmailAddress: {
          emailAddress: "test@example.com",
        },
      },
    };
  });

  it("should return correct multiChoiceStats", async () => {
    const mockRawResults = [
      { fieldName: "Question 1", option: "Option A", count: 10 },
      { fieldName: "Question 1", option: "Option B", count: 5 },
      { fieldName: "Question 2", option: "Yes", count: 8 },
    ];

    mockDb.select.mockReturnValue({
      from: mock().mockReturnThis(),
      innerJoin: mock().mockReturnThis(),
      where: mock().mockReturnThis(),
      groupBy: mock().mockResolvedValue(mockRawResults),
    });

    const caller = conversationRouter.createCaller(mockCtx);
    const result = await caller.multiChoiceStats({ formId: "form_123" });

    expect(result).toHaveLength(2);
    const q1 = result.find((r) => r.fieldName === "Question 1");
    expect(q1?.totalResponses).toBe(15);
    expect(q1?.options).toContainEqual({
      option: "Option A",
      count: 10,
      percentage: 67,
    });
    expect(q1?.options).toContainEqual({
      option: "Option B",
      count: 5,
      percentage: 33,
    });
  });

  it("should return correct ratingStats", async () => {
    const mockRawResults = [
      { fieldName: "Rating 1", rating: "5", count: 10, maxRating: 5 },
      { fieldName: "Rating 1", rating: "4", count: 5, maxRating: 5 },
    ];

    mockDb.select.mockReturnValue({
      from: mock().mockReturnThis(),
      innerJoin: mock().mockReturnThis(),
      where: mock().mockReturnThis(),
      groupBy: mock().mockResolvedValue(mockRawResults),
    });

    const caller = conversationRouter.createCaller(mockCtx);
    const result = await caller.ratingStats({ formId: "form_123" });

    expect(result).toHaveLength(1);
    const r1 = result[0];
    expect(r1.fieldName).toBe("Rating 1");
    expect(r1.totalResponses).toBe(15);
    expect(r1.averageRating).toBe("4.7");
    expect(r1.distribution.find((d) => d.rating === 5)?.count).toBe(10);
    expect(r1.distribution.find((d) => d.rating === 4)?.count).toBe(5);
  });
});
