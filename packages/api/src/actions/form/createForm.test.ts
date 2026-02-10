import { describe, expect, it, mock } from "bun:test";
import { enforceRateLimit } from "@convoform/rate-limiter";
import type { TRPCContext } from "../../trpc";
import { type CreateFormInput, createForm } from "./createForm";

// Mock rate limiter
mock.module("@convoform/rate-limiter", () => ({
  enforceRateLimit: {
    CORE_CREATE: mock(),
  },
}));

describe("createForm Action", () => {
  const mockUserId = "user_123";
  const mockOrganizationId = "org_123";

  const mockDb = {
    insert: mock().mockReturnThis(),
    values: mock().mockReturnThis(),
    returning: mock(),
    update: mock().mockReturnThis(),
    set: mock().mockReturnThis(),
    where: mock().mockReturnThis(),
  } as any;

  const mockAnalytics = {
    track: mock(),
  } as any;

  const mockCtx = {
    db: mockDb,
    userId: mockUserId,
    analytics: mockAnalytics,
  } as unknown as Pick<TRPCContext, "db"> & { userId: string; analytics: any };

  const validInput: CreateFormInput = {
    name: "Test Form",
    overview: "Form Overview",
    welcomeScreenTitle: "Welcome",
    welcomeScreenMessage: "Hello",
    welcomeScreenCTALabel: "Start",
    organizationId: mockOrganizationId,
    formFields: [
      {
        fieldName: "Name",
        fieldDescription: "Your name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
    ],
    formFieldsOrders: [],
    endScreenCTAUrl: null,
    endScreenCTALabel: null,
    googleFormId: null,
    isAIGenerated: false,
    isPublished: false,
  };

  it("should create a form successfully", async () => {
    // Mock DB responses
    const mockSavedForm = {
      id: "form_123",
      organizationId: mockOrganizationId,
      userId: mockUserId,
      ...validInput,
    };

    const mockSavedFormFields = [
      {
        id: "field_123",
        formId: "form_123",
        ...validInput.formFields[0],
      },
    ];

    mockDb.returning
      .mockResolvedValueOnce([mockSavedForm]) // insert form
      .mockResolvedValueOnce(mockSavedFormFields) // insert fields
      .mockResolvedValueOnce([mockSavedForm]); // update form fields order

    const result = await createForm(mockCtx, validInput);

    expect(enforceRateLimit.CORE_CREATE).toHaveBeenCalledWith(mockUserId);
    expect(mockDb.insert).toHaveBeenCalledTimes(3); // form, fields, formDesign
    expect(mockAnalytics.track).toHaveBeenCalledWith(
      "form:create",
      expect.any(Object),
    );
    expect(result.id).toBe("form_123");
    expect(result.formFields).toEqual([mockSavedFormFields]);
  });

  it("should throw error if user is not found in context", async () => {
    const invalidCtx = { ...mockCtx, userId: undefined };
    // @ts-ignore
    await expect(createForm(invalidCtx, validInput)).rejects.toThrow(
      "User not found",
    );
  });

  it("should throw error if form creation fails", async () => {
    mockDb.returning.mockResolvedValueOnce([]); // Empty array means no form created
    await expect(createForm(mockCtx, validInput)).rejects.toThrow(
      "Failed to create form",
    );
  });
});
