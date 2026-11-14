import { beforeEach, describe, expect, it, mock } from "bun:test";

const generatedLabels = {
  generatedAt: new Date("2026-11-14T10:00:00.000Z"),
  tone: {
    value: "casual",
    score: 0.9,
    provider: "cloudflare-clef",
    timestamp: new Date("2026-11-14T10:00:00.000Z"),
  },
  sentiment: {
    value: "positive",
    score: 0.8,
    provider: "cloudflare-clef",
    timestamp: new Date("2026-11-14T10:00:00.000Z"),
  },
  temperature: {
    value: "Hot",
    score: 0.7,
    provider: "cloudflare-clef",
    timestamp: new Date("2026-11-14T10:00:00.000Z"),
  },
};

const generateConversationLabels = mock(async () => generatedLabels);
mock.module("@convoform/ai", () => ({ generateConversationLabels }));

import { generateAndSaveLabels } from "../src/actions/conversation/generateAndSaveLabels";

const conversation = {
  id: "conv_1",
  formId: "form_1",
  organizationId: "org_1",
  transcript: [{ role: "user" as const, content: "Hello" }],
  formFieldResponses: [],
};

const labelSettings = {
  categoriesEnabled: true,
  categories: [{ id: "country", name: "Country", options: ["UK", "Canada"] }],
};

function createCtx() {
  return {
    db: {
      query: {
        form: {
          findFirst: mock(async () => {
            throw new Error("form query should not run");
          }),
        },
      },
      update: mock(() => {
        throw new Error("update should not run");
      }),
    },
  } as any;
}

function createSuccessCtx() {
  const findFirst = mock(async () => ({
    name: "Enquiry",
    overview: "Study abroad enquiry",
    labelSettings,
  }));
  const returning = mock(async () => [{ id: conversation.id }]);
  const where = mock(() => ({ returning }));
  const set = mock(() => ({ where }));
  const update = mock(() => ({ set }));

  const ctx = {
    db: {
      query: { form: { findFirst } },
      update,
    },
  } as any;

  return { ctx, findFirst, update, set, where, returning };
}

beforeEach(() => {
  generateConversationLabels.mockClear();
  generateConversationLabels.mockImplementation(async () => generatedLabels);
});

describe("generateAndSaveLabels", () => {
  it("saves generated labels to metaData", async () => {
    const { ctx, findFirst, update, set } = createSuccessCtx();

    const result = await generateAndSaveLabels(
      { ...conversation, metaData: {} },
      ctx,
    );

    expect(result).toEqual({
      success: true,
      skipped: false,
      labels: generatedLabels,
    });
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledTimes(1);

    const generateArgs = generateConversationLabels.mock.calls[0]?.[0] as {
      categories: unknown;
    };
    expect(generateArgs.categories).toEqual(labelSettings.categories);
  });

  it("saves partial labels when one label times out", async () => {
    generateConversationLabels.mockImplementationOnce(async () => ({
      generatedAt: generatedLabels.generatedAt,
      tone: generatedLabels.tone,
    }));
    const { ctx, update } = createSuccessCtx();

    const result = await generateAndSaveLabels(
      { ...conversation, metaData: {} },
      ctx,
    );

    expect(result).toMatchObject({ success: true, skipped: false });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("does not throw or save when generation fails", async () => {
    generateConversationLabels.mockImplementationOnce(async () => {
      throw new Error("clef unavailable");
    });
    const { ctx, update } = createSuccessCtx();

    const result = await generateAndSaveLabels(
      { ...conversation, metaData: {} },
      ctx,
    );

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: "failed",
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("skips owner previews", async () => {
    const result = await generateAndSaveLabels(
      { ...conversation, isOwnerPreview: true },
      createCtx(),
    );

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: "owner_preview",
    });
  });

  it("skips conversations that already have labels", async () => {
    const result = await generateAndSaveLabels(
      {
        ...conversation,
        metaData: {
          labels: {
            generatedAt: new Date("2026-11-01T10:00:00.000Z"),
            tone: {
              value: "casual",
              score: 0.9,
              provider: "cloudflare-clef",
              timestamp: new Date("2026-11-01T10:00:00.000Z"),
            },
          },
        },
      },
      createCtx(),
    );

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: "labels_already_exist",
    });
  });

  it("skips conversations without a transcript", async () => {
    const result = await generateAndSaveLabels(
      { ...conversation, transcript: null },
      createCtx(),
    );

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: "empty_transcript",
    });
  });
});
