import { describe, expect, it, mock } from "bun:test";
import { form } from "@convoform/db/src/schema";
import { enforceRateLimit } from "@convoform/rate-limiter";
import { updateForm } from "../src/actions/form/updateForm";

// Mock rate limiter
mock.module("@convoform/rate-limiter", () => ({
  enforceRateLimit: {
    CORE_EDIT: mock(),
  },
}));

describe("updateForm Action", () => {
  const mockUserId = "user_123";
  const mockFormId = "form_123";

  const mockDb = {
    update: mock().mockReturnThis(),
    set: mock().mockReturnThis(),
    where: mock().mockReturnThis(),
    returning: mock(),
  } as any;

  const mockAnalytics = {
    track: mock(),
  } as any;

  const mockCtx = {
    db: mockDb,
    userId: mockUserId,
    analytics: mockAnalytics,
  } as any;

  const validUpdateInput = {
    id: mockFormId,
    name: "Updated Name",
    overview: "Updated Overview",
    welcomeScreenTitle: "Updated Title",
    welcomeScreenMessage: "Updated Message",
    welcomeScreenCTALabel: "Updated CTA",
    formFieldsOrders: ["field_1", "field_2"],
  };

  it("should update a form successfully", async () => {
    const mockUpdatedForm = {
      ...validUpdateInput,
      organizationId: "org_123",
      updatedAt: new Date(),
    };

    mockDb.returning.mockResolvedValueOnce([mockUpdatedForm]);

    const result = await updateForm(mockCtx, validUpdateInput);

    expect(enforceRateLimit.CORE_EDIT).toHaveBeenCalledWith(mockUserId);
    expect(mockDb.update).toHaveBeenCalledWith(form);
    expect(mockAnalytics.track).toHaveBeenCalledWith(
      "form:update",
      expect.any(Object),
    );
    expect(result).toEqual(mockUpdatedForm);
  });

  it("should throw error if update failed", async () => {
    mockDb.returning.mockResolvedValueOnce([]); // No form updated
    await expect(updateForm(mockCtx, validUpdateInput)).rejects.toThrow(
      "Failed to update form",
    );
  });

  it("should throw error if user is missing", async () => {
    const invalidCtx = { ...mockCtx, userId: undefined };
    await expect(updateForm(invalidCtx, validUpdateInput)).rejects.toThrow(
      "User not found",
    );
  });
});
