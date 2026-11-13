import { describe, expect, it, mock } from "bun:test";

import { generateAndSaveLabels } from "../src/actions/conversation/generateAndSaveLabels";

const conversation = {
  id: "conv_1",
  formId: "form_1",
  organizationId: "org_1",
  transcript: [{ role: "user" as const, content: "Hello" }],
  formFieldResponses: [],
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

describe("generateAndSaveLabels", () => {
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
