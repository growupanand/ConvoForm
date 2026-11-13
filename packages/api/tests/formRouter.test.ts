import { describe, expect, it, mock } from "bun:test";
import { eq } from "@convoform/db";
import { form } from "@convoform/db/src/schema";
import { TRPCError } from "@trpc/server";

mock.module("@convoform/rate-limiter", () => ({
  enforceRateLimit: {
    CORE_CREATE: mock(async () => undefined),
    CORE_EDIT: mock(async () => undefined),
  },
}));

import { formRouter } from "../src/router/form";

const mockUserId = "user_123";
const mockOrgId = "org_123";
const mockOtherOrgId = "org_456";
const mockFormId = "form_123";

const mockForm = {
  id: mockFormId,
  userId: mockUserId,
  organizationId: mockOrgId,
  name: "Test form",
};

function createCtx(db: unknown) {
  return {
    db,
    auth: {
      userId: mockUserId,
      orgId: mockOrgId,
    },
    user: {},
    analytics: {
      track: mock(async () => undefined),
    },
  } as any;
}

function createUpdateDbMock(returningRows: unknown[]) {
  const returning = mock(async () => returningRows);
  const where = mock(() => ({ returning }));
  const set = mock(() => ({ where }));
  const update = mock(() => ({ set }));

  return { db: { update }, returning, where, set, update };
}

function createDeleteDbMock(deletedRows: unknown[]) {
  const deleteReturning = mock(async () => deletedRows);
  const deleteWhere = mock(() => ({ returning: deleteReturning }));
  const deleteMock = mock(() => ({ where: deleteWhere }));

  const fileFindMany = mock(async () => []);
  const fileUpdateWhere = mock(async () => undefined);
  const fileUpdateSet = mock(() => ({ where: fileUpdateWhere }));
  const fileUpdate = mock(() => ({ set: fileUpdateSet }));

  const tx = {
    delete: deleteMock,
    query: {
      fileUpload: { findMany: fileFindMany },
    },
    update: fileUpdate,
  };

  const transaction = mock(async (callback: (tx: typeof tx) => unknown) =>
    callback(tx),
  );

  return {
    db: { transaction },
    deleteMock,
    deleteWhere,
    fileFindMany,
    fileUpdate,
    fileUpdateSet,
    transaction,
  };
}

function collectCondition(condition: any) {
  const values: unknown[] = [];
  const columns: string[] = [];

  const walk = (chunk: any) => {
    if (!chunk || typeof chunk !== "object") {
      return;
    }

    if (chunk.constructor?.name === "Param") {
      values.push(chunk.value);
    }

    if (chunk.table && typeof chunk.name === "string") {
      columns.push(chunk.name);
    }

    if (Array.isArray(chunk.queryChunks)) {
      for (const child of chunk.queryChunks) {
        walk(child);
      }
    }
  };

  walk(condition);

  return { values, columns };
}

async function expectNotFound(promise: Promise<unknown>) {
  let error: unknown;

  try {
    await promise;
  } catch (caughtError) {
    error = caughtError;
  }

  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toBe("NOT_FOUND");
}

describe("formRouter", () => {
  describe("getAll", () => {
    it("only queries forms from the caller's organization", async () => {
      const findMany = mock(async () => [mockForm]);
      const db = { query: { form: { findMany } } };

      const caller = formRouter.createCaller(createCtx(db));
      const result = await caller.getAll();

      expect(result).toEqual([mockForm]);

      const where = findMany.mock.calls[0]?.[0]?.where;
      expect(typeof where).toBe("function");

      const condition = where(form, { eq });
      const { values, columns } = collectCondition(condition);

      expect(columns).toContain("organizationId");
      expect(values).toContain(mockOrgId);
      expect(values).not.toContain(mockOtherOrgId);
    });
  });

  describe("patch", () => {
    it("updates a form that belongs to the caller's organization", async () => {
      const { db, where } = createUpdateDbMock([
        { ...mockForm, name: "Updated form" },
      ]);

      const caller = formRouter.createCaller(createCtx(db));
      const result = await caller.patch({
        id: mockFormId,
        name: "Updated form",
      });

      expect(result.name).toBe("Updated form");

      const condition = where.mock.calls[0]?.[0];
      const { values, columns } = collectCondition(condition);

      expect(columns).toContain("organizationId");
      expect(values).toContain(mockFormId);
      expect(values).toContain(mockOrgId);
    });

    it("returns NOT_FOUND and does not update a form from another organization", async () => {
      const { db, update } = createUpdateDbMock([]);

      const caller = formRouter.createCaller(createCtx(db));

      await expectNotFound(caller.patch({ id: mockFormId, name: "Hijacked" }));
      expect(update).toHaveBeenCalledTimes(1);
    });
  });

  describe("delete", () => {
    it("deletes a form that belongs to the caller's organization", async () => {
      const { db, deleteMock, transaction } = createDeleteDbMock([mockForm]);

      const caller = formRouter.createCaller(createCtx(db));
      const result = await caller.delete({ id: mockFormId });

      expect(result).toEqual(mockForm);
      expect(transaction).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledTimes(1);
    });

    it("returns NOT_FOUND and leaves files untouched for a form from another organization", async () => {
      const { db, deleteWhere, fileFindMany, fileUpdate } = createDeleteDbMock(
        [],
      );

      const caller = formRouter.createCaller(createCtx(db));

      await expectNotFound(caller.delete({ id: mockFormId }));

      const { values, columns } = collectCondition(
        deleteWhere.mock.calls[0]?.[0],
      );

      expect(columns).toContain("organizationId");
      expect(values).toContain(mockOrgId);
      expect(fileFindMany).not.toHaveBeenCalled();
      expect(fileUpdate).not.toHaveBeenCalled();
    });
  });

  describe("updateShowCustomEndScreenMessage", () => {
    it("updates a form that belongs to the caller's organization", async () => {
      const { db } = createUpdateDbMock([
        { ...mockForm, showCustomEndScreenMessage: true },
      ]);

      const caller = formRouter.createCaller(createCtx(db));
      const result = await caller.updateShowCustomEndScreenMessage({
        formId: mockFormId,
        showCustomEndScreenMessage: true,
        customEndScreenMessage: "Thanks!",
      });

      expect(result.showCustomEndScreenMessage).toBe(true);
    });

    it("returns NOT_FOUND for a form from another organization", async () => {
      const { db } = createUpdateDbMock([]);

      const caller = formRouter.createCaller(createCtx(db));

      await expectNotFound(
        caller.updateShowCustomEndScreenMessage({
          formId: mockFormId,
          showCustomEndScreenMessage: true,
          customEndScreenMessage: "Hijacked",
        }),
      );
    });
  });

  describe("updateIsPublished", () => {
    it("returns NOT_FOUND for a form from another organization", async () => {
      const { db } = createUpdateDbMock([]);

      const caller = formRouter.createCaller(createCtx(db));

      await expectNotFound(
        caller.updateIsPublished({ formId: mockFormId, isPublished: false }),
      );
    });
  });

  describe("updateLabelSettings", () => {
    const labelSettings = {
      categoriesEnabled: true,
      categories: [
        { id: "country", name: "Country", options: ["UK", "Canada"] },
      ],
    };

    it("saves custom categories for a form in the caller's organization", async () => {
      const { db, set } = createUpdateDbMock([{ ...mockForm, labelSettings }]);

      const caller = formRouter.createCaller(createCtx(db));
      const result = await caller.updateLabelSettings({
        formId: mockFormId,
        labelSettings,
      });

      expect(result.labelSettings).toEqual(labelSettings);
      expect(set).toHaveBeenCalledWith({ labelSettings });
    });

    it("returns NOT_FOUND for a form from another organization", async () => {
      const { db } = createUpdateDbMock([]);

      const caller = formRouter.createCaller(createCtx(db));

      await expectNotFound(
        caller.updateLabelSettings({ formId: mockFormId, labelSettings }),
      );
    });

    it("rejects more than three categories", async () => {
      const { db } = createUpdateDbMock([]);
      const caller = formRouter.createCaller(createCtx(db));

      await expect(
        caller.updateLabelSettings({
          formId: mockFormId,
          labelSettings: {
            categoriesEnabled: true,
            categories: [
              { id: "a", name: "A", options: ["1", "2"] },
              { id: "b", name: "B", options: ["1", "2"] },
              { id: "c", name: "C", options: ["1", "2"] },
              { id: "d", name: "D", options: ["1", "2"] },
            ],
          },
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });
  });
});
