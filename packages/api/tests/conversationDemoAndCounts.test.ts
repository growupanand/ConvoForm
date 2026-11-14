import { describe, expect, it, mock } from "bun:test";
import { DEMO_FORM_ID } from "@convoform/common";
import { conversationRouter } from "../src/router/conversation";

function createDemoDb(rows: unknown[]) {
  const findMany = mock(() => Promise.resolve(rows));

  return {
    db: {
      query: {
        conversation: {
          findMany,
        },
      },
    },
    findMany,
  };
}

function collectQueryParamValues(value: unknown): unknown[] {
  const values: unknown[] = [];

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") {
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
      }
      return;
    }

    const record = node as Record<string, unknown>;

    if (Object.prototype.hasOwnProperty.call(record, "value")) {
      values.push(record.value);
    }

    if (Array.isArray(record.queryChunks)) {
      walk(record.queryChunks);
    }
  };

  walk(value);
  return values;
}

describe("conversation.getDemoFormResponses", () => {
  it("rejects every form except the demo form", async () => {
    const { db, findMany } = createDemoDb([]);
    const caller = conversationRouter.createCaller({ db } as any);

    await expect(
      caller.getDemoFormResponses({ formId: "form_1" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns only the fields needed by the landing demo", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const { db } = createDemoDb([
      {
        id: "conv_1",
        name: "Demo response",
        createdAt,
        updatedAt: createdAt,
        finishedAt: createdAt,
        isInProgress: false,
        channelType: "web",
        formId: DEMO_FORM_ID,
        organizationId: "org_1",
        transcript: [{ role: "user", content: "private transcript" }],
        metaData: { ipAddress: "203.0.113.10" },
        formFieldResponses: [
          {
            id: "field_1",
            fieldName: "Name",
            fieldDescription: "Your name",
            fieldConfiguration: { inputType: "text", inputConfiguration: {} },
            fieldValue: "Ada",
          },
        ],
      },
    ]);
    const caller = conversationRouter.createCaller({ db } as any);

    const result = await caller.getDemoFormResponses({ formId: DEMO_FORM_ID });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "conv_1",
      name: "Demo response",
      createdAt,
      updatedAt: createdAt,
      finishedAt: createdAt,
      isInProgress: false,
      channelType: "web",
      formFieldResponses: [{ fieldValue: "Ada" }],
    });
    expect(result[0]).not.toHaveProperty("organizationId");
    expect(result[0]).not.toHaveProperty("transcript");
    expect(result[0]).not.toHaveProperty("metaData");
  });
});

describe("conversation.getCountByFormIds", () => {
  it("uses the caller's organization and ignores a client-sent organizationId", async () => {
    const orderBy = mock(() => Promise.resolve([]));
    const groupBy = mock(() => ({ orderBy }));
    const where = mock(() => ({ groupBy }));
    const leftJoin = mock(() => ({ where }));
    const from = mock(() => ({ leftJoin }));
    const select = mock(() => ({ from }));

    const caller = conversationRouter.createCaller({
      db: { select },
      auth: {
        userId: "user_1",
        orgId: "org_ctx",
      },
      user: { id: "user_1" },
    } as any);

    await caller.getCountByFormIds({
      formIds: ["form_1"],
      organizationId: "org_client",
    } as any);

    const queryValues = collectQueryParamValues(where.mock.calls[0]?.[0]);

    expect(queryValues).toContain("org_ctx");
    expect(queryValues).toContain("form_1");
    expect(queryValues).not.toContain("org_client");
  });
});

describe("conversation.create", () => {
  it("is not exposed through tRPC", () => {
    const procedures = Object.keys(conversationRouter._def.procedures);

    expect(procedures).not.toContain("create");
  });
});
