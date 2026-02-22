import { beforeEach, describe, expect, it, mock } from "bun:test";

// Mock modules before importing the router (to avoid env validation at load)
mock.module("@convoform/common", () => ({
  encrypt: mock().mockResolvedValue("encrypted_token_value"),
  decrypt: mock().mockResolvedValue("decrypted_token_value"),
}));

mock.module("../src/env", () => ({
  env: {
    ENCRYPTION_KEY: "test-encryption-key-for-unit-tests",
  },
}));

import { channelConnectionRouter } from "../src/router/channelConnection";

describe("channelConnectionRouter", () => {
  const mockOrganizationId = "org_123";
  const mockUserId = "user_123";
  const mockFormId = "form_123";

  let mockDb: any;
  let mockCtx: any;

  beforeEach(() => {
    mockDb = {
      query: {
        form: {
          findFirst: mock(),
        },
        channelConnection: {
          findFirst: mock(),
          findMany: mock(),
        },
      },
      insert: mock().mockReturnThis(),
      values: mock().mockReturnThis(),
      returning: mock(),
      update: mock().mockReturnThis(),
      set: mock().mockReturnThis(),
      where: mock().mockReturnThis(),
      delete: mock().mockReturnThis(),
    };

    mockCtx = {
      db: mockDb,
      auth: {
        userId: mockUserId,
        orgId: mockOrganizationId,
      },
      orgId: mockOrganizationId,
      userId: mockUserId,
      user: {
        primaryEmailAddress: {
          emailAddress: "test@example.com",
        },
      },
    };
  });

  describe("listForForm", () => {
    it("should return connections for a form", async () => {
      const mockConnections = [
        {
          id: "conn_1",
          formId: mockFormId,
          channelType: "telegram",
          enabled: true,
          channelConfig: { botToken: "encrypted", secretToken: "secret" },
          organizationId: mockOrganizationId,
        },
      ];

      mockDb.query.form.findFirst.mockResolvedValue({ id: mockFormId });
      mockDb.query.channelConnection.findMany.mockResolvedValue(
        mockConnections,
      );

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.listForForm({ formId: mockFormId });

      expect(result).toEqual(mockConnections);
      expect(result).toHaveLength(1);
      expect(result[0].channelType).toBe("telegram");
    });

    it("should throw NOT_FOUND if form does not exist", async () => {
      mockDb.query.form.findFirst.mockResolvedValue(null);

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(
        caller.listForForm({ formId: "non_existent" }),
      ).rejects.toThrow("Form not found");
    });
  });

  describe("create", () => {
    it("should create a channel connection with auto-generated secretToken", async () => {
      const mockConnection = {
        id: "conn_new",
        formId: mockFormId,
        channelType: "telegram",
        enabled: true,
        channelConfig: {
          botToken: "encrypted_token_value",
          secretToken: "generated_secret",
        },
        organizationId: mockOrganizationId,
      };

      mockDb.query.form.findFirst.mockResolvedValue({ id: mockFormId });
      mockDb.query.channelConnection.findFirst.mockResolvedValue(null);

      mockDb.insert.mockReturnValue({
        values: mock().mockReturnValue({
          returning: mock().mockResolvedValue([mockConnection]),
        }),
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.create({
        formId: mockFormId,
        channelType: "telegram",
        channelConfig: { botToken: "123456:ABC-DEF" },
      });

      expect(result.id).toBe("conn_new");
      expect(result.channelType).toBe("telegram");
      expect(result.enabled).toBe(true);
    });

    it("should reject duplicate channelType+formId", async () => {
      mockDb.query.form.findFirst.mockResolvedValue({ id: mockFormId });
      mockDb.query.channelConnection.findFirst.mockResolvedValue({
        id: "existing_conn",
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(
        caller.create({
          formId: mockFormId,
          channelType: "telegram",
          channelConfig: { botToken: "123456:ABC-DEF" },
        }),
      ).rejects.toThrow("already exists");
    });
  });

  describe("update", () => {
    it("should toggle enabled state", async () => {
      const mockConnection = {
        id: "conn_1",
        enabled: true,
        channelConfig: { botToken: "encrypted", secretToken: "secret" },
        organizationId: mockOrganizationId,
      };

      const updatedConnection = { ...mockConnection, enabled: false };

      mockDb.query.channelConnection.findFirst.mockResolvedValue(
        mockConnection,
      );

      mockDb.update.mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock().mockResolvedValue([updatedConnection]),
          }),
        }),
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: "conn_1",
        enabled: false,
      });

      expect(result.enabled).toBe(false);
    });

    it("should throw NOT_FOUND for non-existent connection", async () => {
      mockDb.query.channelConnection.findFirst.mockResolvedValue(null);

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(
        caller.update({ id: "non_existent", enabled: false }),
      ).rejects.toThrow("Channel connection not found");
    });
  });

  describe("delete", () => {
    it("should delete a connection", async () => {
      mockDb.query.channelConnection.findFirst.mockResolvedValue({
        id: "conn_1",
        organizationId: mockOrganizationId,
      });

      mockDb.delete.mockReturnValue({
        where: mock().mockResolvedValue(undefined),
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.delete({ id: "conn_1" });

      expect(result.success).toBe(true);
    });

    it("should throw NOT_FOUND for non-existent connection", async () => {
      mockDb.query.channelConnection.findFirst.mockResolvedValue(null);

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(caller.delete({ id: "non_existent" })).rejects.toThrow(
        "Channel connection not found",
      );
    });
  });
});
