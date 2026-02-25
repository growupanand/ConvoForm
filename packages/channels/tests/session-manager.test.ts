import { beforeEach, describe, expect, it } from "bun:test";
import { InMemorySessionManager } from "../src/session-manager";

describe("SessionManager", () => {
  let manager: InMemorySessionManager;

  beforeEach(() => {
    manager = new InMemorySessionManager();
  });

  describe("setSession / getSession", () => {
    it("should store and retrieve a session", () => {
      const now = new Date();
      manager.setSession("telegram", "user_123", "form_abc", {
        conversationId: "conv_xyz",
        currentFieldId: "field_1",
        createdAt: now,
        lastAccessedAt: now,
      });

      const session = manager.getSession("telegram", "user_123", "form_abc");
      expect(session).toBeDefined();
      expect(session?.conversationId).toBe("conv_xyz");
      expect(session?.currentFieldId).toBe("field_1");
    });

    it("should return undefined for non-existent sessions", () => {
      const session = manager.getSession("telegram", "unknown", "form_abc");
      expect(session).toBeUndefined();
    });

    it("should use composite key — different formId means different session", () => {
      const now = new Date();
      manager.setSession("telegram", "user_123", "form_1", {
        conversationId: "conv_1",
        currentFieldId: "field_1",
        createdAt: now,
        lastAccessedAt: now,
      });
      manager.setSession("telegram", "user_123", "form_2", {
        conversationId: "conv_2",
        currentFieldId: "field_2",
        createdAt: now,
        lastAccessedAt: now,
      });

      const session1 = manager.getSession("telegram", "user_123", "form_1");
      const session2 = manager.getSession("telegram", "user_123", "form_2");
      expect(session1?.conversationId).toBe("conv_1");
      expect(session2?.conversationId).toBe("conv_2");
    });

    it("should use composite key — different channelType means different session", () => {
      const now = new Date();
      manager.setSession("telegram", "user_123", "form_abc", {
        conversationId: "conv_tg",
        currentFieldId: null,
        createdAt: now,
        lastAccessedAt: now,
      });
      manager.setSession("whatsapp", "user_123", "form_abc", {
        conversationId: "conv_wa",
        currentFieldId: null,
        createdAt: now,
        lastAccessedAt: now,
      });

      expect(
        manager.getSession("telegram", "user_123", "form_abc")?.conversationId,
      ).toBe("conv_tg");
      expect(
        manager.getSession("whatsapp", "user_123", "form_abc")?.conversationId,
      ).toBe("conv_wa");
    });

    it("should update lastAccessedAt on getSession", () => {
      const past = new Date("2024-01-01");
      manager.setSession("telegram", "user_123", "form_abc", {
        conversationId: "conv_xyz",
        currentFieldId: null,
        createdAt: past,
        lastAccessedAt: past,
      });

      const session = manager.getSession("telegram", "user_123", "form_abc");
      expect(session?.lastAccessedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it("should overwrite existing session on setSession", () => {
      const now = new Date();
      manager.setSession("telegram", "user_123", "form_abc", {
        conversationId: "conv_old",
        currentFieldId: "field_1",
        createdAt: now,
        lastAccessedAt: now,
      });
      manager.setSession("telegram", "user_123", "form_abc", {
        conversationId: "conv_new",
        currentFieldId: "field_2",
        createdAt: now,
        lastAccessedAt: now,
      });

      const session = manager.getSession("telegram", "user_123", "form_abc");
      expect(session?.conversationId).toBe("conv_new");
      expect(session?.currentFieldId).toBe("field_2");
    });
  });

  describe("deleteSession", () => {
    it("should delete an existing session and return true", () => {
      const now = new Date();
      manager.setSession("telegram", "user_123", "form_abc", {
        conversationId: "conv_xyz",
        currentFieldId: null,
        createdAt: now,
        lastAccessedAt: now,
      });

      const result = manager.deleteSession("telegram", "user_123", "form_abc");
      expect(result).toBe(true);
      expect(
        manager.getSession("telegram", "user_123", "form_abc"),
      ).toBeUndefined();
    });

    it("should return false for non-existent session", () => {
      const result = manager.deleteSession("telegram", "unknown", "form_abc");
      expect(result).toBe(false);
    });
  });

  describe("clearExpiredSessions", () => {
    it("should remove sessions older than maxAgeMs", () => {
      const old = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const recent = new Date();

      manager.setSession("telegram", "old_user", "form_abc", {
        conversationId: "conv_old",
        currentFieldId: null,
        createdAt: old,
        lastAccessedAt: old,
      });
      manager.setSession("telegram", "new_user", "form_abc", {
        conversationId: "conv_new",
        currentFieldId: null,
        createdAt: recent,
        lastAccessedAt: recent,
      });

      const cleared = manager.clearExpiredSessions(60 * 60 * 1000); // 1 hour
      expect(cleared).toBe(1);
      expect(
        manager.getSession("telegram", "old_user", "form_abc"),
      ).toBeUndefined();
      expect(
        manager.getSession("telegram", "new_user", "form_abc"),
      ).toBeDefined();
    });

    it("should return 0 when no sessions are expired", () => {
      const now = new Date();
      manager.setSession("telegram", "user_1", "form_abc", {
        conversationId: "conv_1",
        currentFieldId: null,
        createdAt: now,
        lastAccessedAt: now,
      });

      const cleared = manager.clearExpiredSessions(60 * 60 * 1000);
      expect(cleared).toBe(0);
    });
  });

  describe("size", () => {
    it("should return 0 for empty manager", () => {
      expect(manager.size).toBe(0);
    });

    it("should reflect the number of active sessions", () => {
      const now = new Date();
      manager.setSession("telegram", "user_1", "form_abc", {
        conversationId: "conv_1",
        currentFieldId: null,
        createdAt: now,
        lastAccessedAt: now,
      });
      manager.setSession("telegram", "user_2", "form_abc", {
        conversationId: "conv_2",
        currentFieldId: null,
        createdAt: now,
        lastAccessedAt: now,
      });

      expect(manager.size).toBe(2);
    });
  });
});
