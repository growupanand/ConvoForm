import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

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
  const mockBotId = "123456";

  let mockDb: any;
  let mockCtx: any;

  beforeEach(() => {
    mockDb = {
      query: {
        form: {
          findFirst: mock(),
          findMany: mock(),
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
          channelIdentifier: mockBotId,
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

  describe("listForOrg", () => {
    it("should return all connections for the organization", async () => {
      const mockConnections = [
        {
          id: "conn_1",
          formId: "form_1",
          channelType: "telegram",
          enabled: true,
          channelConfig: {},
          organizationId: mockOrganizationId,
          channelIdentifier: "111",
          form: { id: "form_1", name: "Contact Form" },
        },
        {
          id: "conn_2",
          formId: null,
          channelType: "telegram",
          enabled: true,
          channelConfig: {},
          organizationId: mockOrganizationId,
          channelIdentifier: "222",
          form: null,
        },
      ];

      mockDb.query.channelConnection.findMany.mockResolvedValue(
        mockConnections,
      );

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.listForOrg();

      expect(result).toEqual(mockConnections);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no connections exist", async () => {
      mockDb.query.channelConnection.findMany.mockResolvedValue([]);

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.listForOrg();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("listAvailableForForm", () => {
    it("should return unassigned bots and bots on this form", async () => {
      const mockBots = [
        {
          id: "conn_1",
          formId: mockFormId,
          channelType: "telegram",
          channelIdentifier: "111",
        },
        {
          id: "conn_2",
          formId: null,
          channelType: "telegram",
          channelIdentifier: "222",
        },
      ];

      mockDb.query.channelConnection.findMany.mockResolvedValue(mockBots);

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.listAvailableForForm({
        formId: mockFormId,
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("create", () => {
    it("should create a bot without formId (unassigned)", async () => {
      const mockConnection = {
        id: "conn_new",
        formId: null,
        channelType: "telegram",
        enabled: true,
        channelConfig: {
          botToken: "encrypted_token_value",
          secretToken: "generated_secret",
        },
        organizationId: mockOrganizationId,
        channelIdentifier: mockBotId,
      };

      mockDb.insert.mockReturnValue({
        values: mock().mockReturnValue({
          returning: mock().mockResolvedValue([mockConnection]),
        }),
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.create({
        channelType: "telegram",
        channelConfig: { botToken: `${mockBotId}:ABC-DEF` },
      });

      expect(result.id).toBe("conn_new");
      expect(result.formId).toBeNull();
      expect(result.channelType).toBe("telegram");
      expect(result.enabled).toBe(true);
    });

    it("should create a bot with formId (assigned)", async () => {
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
        channelIdentifier: mockBotId,
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
        channelConfig: { botToken: `${mockBotId}:ABC-DEF` },
      });

      expect(result.id).toBe("conn_new");
      expect(result.formId).toBe(mockFormId);
    });

    it("should reject if form already has a bot of same type", async () => {
      mockDb.query.form.findFirst.mockResolvedValue({ id: mockFormId });
      mockDb.query.channelConnection.findFirst.mockResolvedValue({
        id: "existing_conn",
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(
        caller.create({
          formId: mockFormId,
          channelType: "telegram",
          channelConfig: { botToken: `${mockBotId}:ABC-DEF` },
        }),
      ).rejects.toThrow("already assigned");
    });
  });

  describe("assignForm", () => {
    it("should assign a bot to a form", async () => {
      const mockBot = {
        id: "conn_1",
        channelType: "telegram",
        formId: null,
        organizationId: mockOrganizationId,
      };

      const updatedBot = { ...mockBot, formId: mockFormId };

      mockDb.query.channelConnection.findFirst
        .mockResolvedValueOnce(mockBot) // bot lookup
        .mockResolvedValueOnce(null); // no existing bot on form

      mockDb.query.form.findFirst.mockResolvedValue({ id: mockFormId });

      mockDb.update.mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock().mockResolvedValue([updatedBot]),
          }),
        }),
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.assignForm({
        id: "conn_1",
        formId: mockFormId,
      });

      expect(result.formId).toBe(mockFormId);
    });

    it("should reject if another bot is already on the form", async () => {
      const mockBot = {
        id: "conn_1",
        channelType: "telegram",
        formId: null,
        organizationId: mockOrganizationId,
      };

      mockDb.query.channelConnection.findFirst
        .mockResolvedValueOnce(mockBot) // bot lookup
        .mockResolvedValueOnce({ id: "conn_other" }); // existing bot on form

      mockDb.query.form.findFirst.mockResolvedValue({ id: mockFormId });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(
        caller.assignForm({ id: "conn_1", formId: mockFormId }),
      ).rejects.toThrow("already assigned");
    });

    it("should throw NOT_FOUND for non-existent bot", async () => {
      mockDb.query.channelConnection.findFirst.mockResolvedValue(null);

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(
        caller.assignForm({ id: "non_existent", formId: mockFormId }),
      ).rejects.toThrow("Bot not found");
    });
  });

  describe("unassignForm", () => {
    it("should unassign a bot from its form", async () => {
      const mockBot = {
        id: "conn_1",
        formId: mockFormId,
        organizationId: mockOrganizationId,
      };

      const updatedBot = { ...mockBot, formId: null };

      mockDb.query.channelConnection.findFirst.mockResolvedValue(mockBot);

      mockDb.update.mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock().mockResolvedValue([updatedBot]),
          }),
        }),
      });

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.unassignForm({ id: "conn_1" });

      expect(result.formId).toBeNull();
    });

    it("should throw NOT_FOUND for non-existent bot", async () => {
      mockDb.query.channelConnection.findFirst.mockResolvedValue(null);

      const caller = channelConnectionRouter.createCaller(mockCtx);
      await expect(caller.unassignForm({ id: "non_existent" })).rejects.toThrow(
        "Bot not found",
      );
    });
  });

  describe("update", () => {
    it("should toggle enabled state", async () => {
      const mockConnection = {
        id: "conn_1",
        enabled: true,
        channelConfig: { botToken: "encrypted", secretToken: "secret" },
        organizationId: mockOrganizationId,
        channelIdentifier: mockBotId,
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
        channelIdentifier: mockBotId,
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

  describe("channelServerHealth", () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it("should return isOnline: true when server responds OK", async () => {
      globalThis.fetch = mock().mockResolvedValue({ ok: true }) as any;

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.channelServerHealth();

      expect(result).toEqual({ isOnline: true });
    });

    it("should return isOnline: false when server is unreachable", async () => {
      globalThis.fetch = mock().mockRejectedValue(
        new Error("Connection refused"),
      ) as any;

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.channelServerHealth();

      expect(result).toEqual({ isOnline: false });
    });

    it("should return isOnline: false when server returns non-OK status", async () => {
      globalThis.fetch = mock().mockResolvedValue({ ok: false }) as any;

      const caller = channelConnectionRouter.createCaller(mockCtx);
      const result = await caller.channelServerHealth();

      expect(result).toEqual({ isOnline: false });
    });
  });
});
