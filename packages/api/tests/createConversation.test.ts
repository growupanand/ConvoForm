import { describe, expect, it, mock } from "bun:test";

const trackMock = mock(() => Promise.resolve());

mock.module("@convoform/analytics", () => ({
  analytics: {
    track: trackMock,
    captureException: mock(() => Promise.resolve()),
  },
}));

import { createConversation } from "../src/actions/conversation/createConversation";

describe("createConversation", () => {
  it("creates the conversation as in progress", async () => {
    const valuesCalls: Record<string, unknown>[] = [];
    const now = new Date();

    const db = {
      insert: mock(() => ({
        values: mock((values: Record<string, unknown>) => {
          valuesCalls.push(values);
          return {
            returning: mock(() =>
              Promise.resolve([
                {
                  id: "conv_1",
                  formId: "form_1",
                  organizationId: "org_1",
                  name: "New Conversation",
                  transcript: [],
                  formFieldResponses: [],
                  formOverview: "Overview",
                  finishedAt: null,
                  isInProgress: true,
                  metaData: {},
                  currentFieldId: null,
                  channelType: null,
                  channelSenderId: null,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            ),
          };
        }),
      })),
    } as any;

    await createConversation(
      {
        formId: "form_1",
        name: "New Conversation",
        organizationId: "org_1",
        transcript: [],
        formFieldResponses: [
          {
            id: "field_1",
            fieldName: "Name",
            fieldDescription: "The respondent's name",
            fieldValue: null,
            fieldConfiguration: {
              inputType: "text",
              inputConfiguration: {},
            },
          },
        ],
        formOverview: "Overview",
        metaData: {},
      } as any,
      { db },
    );

    expect(valuesCalls[0]).toMatchObject({ isInProgress: true });
  });
});
