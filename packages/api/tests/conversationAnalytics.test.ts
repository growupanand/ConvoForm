import { describe, expect, it } from "bun:test";
import { buildConversationAnalyticsTrackPayload } from "../src/actions/conversation/conversationAnalytics";

describe("buildConversationAnalyticsTrackPayload", () => {
  it("uses conversation id as distinctId and omits answer payloads", () => {
    const payload = buildConversationAnalyticsTrackPayload({
      id: "conv_abc",
      formId: "form_1",
      organizationId: "org_1",
      isInProgress: true,
      metaData: { isOwnerPreview: true },
      formFieldResponses: [
        { fieldValue: "yes" },
        { fieldValue: null },
        { fieldValue: "" },
      ],
      transcript: [{ role: "user", content: "secret answer text" }],
    });

    expect(payload.distinctId).toBe("conv_abc");
    expect(payload.groups).toEqual({ organization: "org_1" });
    expect(payload.properties).toEqual({
      conversationId: "conv_abc",
      formId: "form_1",
      organizationId: "org_1",
      isInProgress: true,
      finishedAt: undefined,
      answeredFieldsCount: 1,
      totalFields: 3,
      transcriptMessageCount: 1,
      isOwnerPreview: true,
    });
    expect(payload.properties).not.toHaveProperty("name");
    expect(payload.properties).not.toHaveProperty("transcript");
    expect(payload.properties).not.toHaveProperty("formFieldResponses");
  });
});
