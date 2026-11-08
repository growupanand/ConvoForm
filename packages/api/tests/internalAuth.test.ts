import { beforeEach, describe, expect, it, mock } from "bun:test";
import { encrypt, signPayload } from "@convoform/common";

const secret = "test-internal-secret";
const encryptionKey = "test-encryption-key";

const sendFormResponseEmailMock = mock(() => Promise.resolve());
const onResponseMock = mock(() => Promise.resolve(undefined));

process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/callback";

mock.module("@convoform/db/src/env", () => ({
  env: { DATABASE_URL: "postgresql://localhost/test" },
  databaseEnvSchema: {},
}));

mock.module("../src/env", () => ({
  env: {
    INTERNAL_EMAIL_API_SECRET: secret,
    ENCRYPTION_KEY: encryptionKey,
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
}));

mock.module("@convoform/email", () => ({
  sendFormResponseEmail: sendFormResponseEmailMock,
  sendContinueOnDesktopEmail: mock(() => Promise.resolve()),
}));

mock.module("@convoform/integration", () => ({
  GoogleSheetsProvider: class {
    onResponse(...args: unknown[]) {
      return onResponseMock(...args);
    }
  },
}));

const { emailRouter } = await import("../src/router/email");
const { integrationRouter } = await import("../src/router/integration");

const rawBody = JSON.stringify({ json: { responseId: "conv_1" } });

function buildContext(options: {
  db: unknown;
  rawBody?: string;
  signature?: string;
}) {
  const headers = new Headers();
  if (options.signature) {
    headers.set("X-ConvoForm-Signature", options.signature);
  }

  return {
    db: options.db,
    auth: { userId: null, orgId: null },
    user: null,
    headers,
    rawBody: options.rawBody,
  } as any;
}

const finishedConversation = {
  id: "conv_1",
  formId: "form_1",
  transcript: [
    { role: "user" as const, content: "Hello" },
    { role: "assistant" as const, content: "Hi there" },
  ],
  formFieldResponses: [{ fieldName: "Name", fieldValue: "Ada" }],
  metaData: { ipAddress: "203.0.113.10" },
  finishedAt: new Date("2026-01-01T10:00:00.000Z"),
  createdAt: new Date("2026-01-01T09:55:00.000Z"),
};

function createEmailDbMock(
  row: Record<string, unknown> | null = {
    ...finishedConversation,
    formName: "Contact form",
    ownerEmail: "owner@example.com",
  },
) {
  const limit = mock(() => Promise.resolve(row ? [row] : []));

  return {
    select: mock().mockReturnValue({
      from: mock().mockReturnValue({
        innerJoin: mock().mockReturnValue({
          innerJoin: mock().mockReturnValue({
            where: mock().mockReturnValue({ limit }),
          }),
        }),
      }),
    }),
  };
}

function createIntegrationDbMock({
  conversation = finishedConversation,
  formIntegrations = [] as unknown[],
} = {}) {
  return {
    query: {
      conversation: {
        findFirst: mock(() => Promise.resolve(conversation)),
      },
      formIntegration: {
        findMany: mock(() => Promise.resolve(formIntegrations)),
      },
      form: {
        findFirst: mock(() =>
          Promise.resolve({ id: conversation.formId, name: "Contact form" }),
        ),
      },
    },
    update: mock().mockReturnValue({
      set: mock().mockReturnValue({
        where: mock(() => Promise.resolve()),
      }),
    }),
  };
}

describe("internalProcedure authentication", () => {
  beforeEach(() => {
    sendFormResponseEmailMock.mockClear();
    onResponseMock.mockClear();
  });

  describe("email.sendFormResponse", () => {
    it("rejects a request without a signature", async () => {
      const caller = emailRouter.createCaller(
        buildContext({ db: createEmailDbMock(), rawBody }),
      );

      await expect(
        caller.sendFormResponse({ responseId: "conv_1" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(sendFormResponseEmailMock).not.toHaveBeenCalled();
    });

    it("rejects an invalid signature", async () => {
      const signature = await signPayload("some other body", secret);
      const caller = emailRouter.createCaller(
        buildContext({ db: createEmailDbMock(), rawBody, signature }),
      );

      await expect(
        caller.sendFormResponse({ responseId: "conv_1" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(sendFormResponseEmailMock).not.toHaveBeenCalled();
    });

    it("rejects a valid signature over a modified body", async () => {
      const signature = await signPayload(rawBody, secret);
      const caller = emailRouter.createCaller(
        buildContext({
          db: createEmailDbMock(),
          rawBody: `${rawBody} `,
          signature,
        }),
      );

      await expect(
        caller.sendFormResponse({ responseId: "conv_1" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(sendFormResponseEmailMock).not.toHaveBeenCalled();
    });

    it("rejects a request when the raw body is unavailable", async () => {
      const signature = await signPayload(rawBody, secret);
      const caller = emailRouter.createCaller(
        buildContext({ db: createEmailDbMock(), signature }),
      );

      await expect(
        caller.sendFormResponse({ responseId: "conv_1" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(sendFormResponseEmailMock).not.toHaveBeenCalled();
    });

    it("rejects an unfinished conversation", async () => {
      const signature = await signPayload(rawBody, secret);
      const caller = emailRouter.createCaller(
        buildContext({
          db: createEmailDbMock({
            ...finishedConversation,
            finishedAt: null,
            formName: "Contact form",
            ownerEmail: "owner@example.com",
          }),
          rawBody,
          signature,
        }),
      );

      await expect(
        caller.sendFormResponse({ responseId: "conv_1" }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(sendFormResponseEmailMock).not.toHaveBeenCalled();
    });

    it("sends the email to the form owner from the stored conversation", async () => {
      const signature = await signPayload(rawBody, secret);
      const caller = emailRouter.createCaller(
        buildContext({ db: createEmailDbMock(), rawBody, signature }),
      );

      await caller.sendFormResponse({ responseId: "conv_1" });

      expect(sendFormResponseEmailMock).toHaveBeenCalledWith({
        to: "owner@example.com",
        formName: "Contact form",
        responseId: "conv_1",
        currentFieldResponses: [{ fieldName: "Name", fieldValue: "Ada" }],
        transcript: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there" },
        ],
        metadata: { ipAddress: "203.0.113.10" },
        responseLink: "http://localhost:3000/forms/form_1/conversations/conv_1",
      });
    });
  });

  describe("integration.sync", () => {
    it("rejects a request without a signature", async () => {
      const db = createIntegrationDbMock();
      const caller = integrationRouter.createCaller(
        buildContext({ db, rawBody }),
      );

      await expect(caller.sync({ responseId: "conv_1" })).rejects.toMatchObject(
        { code: "UNAUTHORIZED" },
      );
      expect(db.query.conversation.findFirst).not.toHaveBeenCalled();
    });

    it("rejects an invalid signature", async () => {
      const db = createIntegrationDbMock();
      const signature = await signPayload("some other body", secret);
      const caller = integrationRouter.createCaller(
        buildContext({ db, rawBody, signature }),
      );

      await expect(caller.sync({ responseId: "conv_1" })).rejects.toMatchObject(
        { code: "UNAUTHORIZED" },
      );
      expect(db.query.conversation.findFirst).not.toHaveBeenCalled();
    });

    it("rejects a valid signature over a modified body", async () => {
      const db = createIntegrationDbMock();
      const signature = await signPayload(rawBody, secret);
      const caller = integrationRouter.createCaller(
        buildContext({ db, rawBody: `${rawBody} `, signature }),
      );

      await expect(caller.sync({ responseId: "conv_1" })).rejects.toMatchObject(
        { code: "UNAUTHORIZED" },
      );
      expect(db.query.conversation.findFirst).not.toHaveBeenCalled();
    });

    it("rejects an unfinished conversation", async () => {
      const db = createIntegrationDbMock({
        conversation: { ...finishedConversation, finishedAt: null },
      });
      const signature = await signPayload(rawBody, secret);
      const caller = integrationRouter.createCaller(
        buildContext({ db, rawBody, signature }),
      );

      await expect(caller.sync({ responseId: "conv_1" })).rejects.toMatchObject(
        { code: "BAD_REQUEST" },
      );
      expect(db.query.formIntegration.findMany).not.toHaveBeenCalled();
    });

    it("syncs using the conversation stored on the server", async () => {
      const encryptedAccessToken = await encrypt(
        "google-access-token",
        encryptionKey,
      );
      const db = createIntegrationDbMock({
        conversation: {
          ...finishedConversation,
          metaData: { channel: { sender: "telegram" } },
        },
        formIntegrations: [
          {
            id: "form_integration_1",
            config: { spreadsheetId: "sheet_1" },
            integration: {
              provider: "google_sheets",
              encryptedAccessToken,
              encryptedRefreshToken: null,
            },
          },
        ],
      });
      const signature = await signPayload(rawBody, secret);
      const caller = integrationRouter.createCaller(
        buildContext({ db, rawBody, signature }),
      );

      const result = await caller.sync({ responseId: "conv_1" });

      expect(result).toEqual({ success: true, processed: 1 });
      expect(onResponseMock).toHaveBeenCalledWith(
        {
          Name: "Ada",
          meta_channel: { sender: "telegram" },
          id: "conv_1",
          createdAt: "2026-01-01T09:55:00.000Z",
        },
        { spreadsheetId: "sheet_1" },
        { accessToken: "google-access-token", refreshToken: undefined },
        { formId: "form_1", formName: "Contact form" },
      );
    });
  });
});
