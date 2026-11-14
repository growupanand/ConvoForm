import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";

const handleUserCreatedMock = mock(() => Promise.resolve());
const handleUserDeletedMock = mock(() => Promise.resolve());
const handleOrganizationCreatedMock = mock(() => Promise.resolve());
const handleOrganizationDeletedMock = mock(() => Promise.resolve());
const handleOrganizationMembershipCreatedMock = mock(() => Promise.resolve());
const handleOrganizationMembershipDeletedMock = mock(() => Promise.resolve());

mock.module("@convoform/api/src/actions/webhook", () => ({
  handleUserCreated: handleUserCreatedMock,
  handleUserDeleted: handleUserDeletedMock,
  handleOrganizationCreated: handleOrganizationCreatedMock,
  handleOrganizationDeleted: handleOrganizationDeletedMock,
  handleOrganizationMembershipCreated: handleOrganizationMembershipCreatedMock,
  handleOrganizationMembershipDeleted: handleOrganizationMembershipDeletedMock,
}));

// Importing the real db module needs a connection string; no connection is
// opened until a query runs.
process.env.DATABASE_URL = "postgresql://localhost/test";

const signingKey = Buffer.from("test-clerk-webhook-signing-secret");
process.env.CLERK_WEBHOOK_SIGNING_SECRET = `whsec_${signingKey.toString("base64")}`;

const { POST } = await import("./route");

const messageId = "msg_test_123";

function sign(payload: string, timestamp = currentTimestamp()) {
  const signature = createHmac("sha256", signingKey)
    .update(`${messageId}.${timestamp}.${payload}`)
    .digest("base64");
  return `v1,${signature}`;
}

function currentTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function buildRequest({
  payload,
  signature,
  timestamp = currentTimestamp(),
}: {
  payload: string;
  signature?: string;
  timestamp?: string;
}) {
  const headers = new Headers();
  if (signature) {
    headers.set("svix-id", messageId);
    headers.set("svix-timestamp", timestamp);
    headers.set("svix-signature", signature);
  }

  return new NextRequest("http://localhost/api/webhook", {
    method: "POST",
    headers,
    body: payload,
  });
}

const userCreatedPayload = JSON.stringify({
  type: "user.created",
  data: {
    id: "user_clerk_1",
    email_addresses: [{ email_address: "new@example.com" }],
    external_accounts: [{ provider: "google" }],
    first_name: "New",
    last_name: "User",
    image_url: "https://example.com/avatar.png",
  },
});

const userDeletedPayload = JSON.stringify({
  type: "user.deleted",
  data: { id: "user_clerk_1" },
});

describe("Clerk webhook route", () => {
  beforeEach(() => {
    handleUserCreatedMock.mockClear();
    handleUserDeletedMock.mockClear();
    handleOrganizationCreatedMock.mockClear();
    handleOrganizationDeletedMock.mockClear();
    handleOrganizationMembershipCreatedMock.mockClear();
    handleOrganizationMembershipDeletedMock.mockClear();
  });

  it("rejects a request without Clerk signature headers", async () => {
    const response = await POST(buildRequest({ payload: userDeletedPayload }));

    expect(response.status).toBe(400);
    expect(handleUserDeletedMock).not.toHaveBeenCalled();
  });

  it("rejects a request with an invalid signature", async () => {
    const response = await POST(
      buildRequest({
        payload: userDeletedPayload,
        signature: sign("some other payload"),
      }),
    );

    expect(response.status).toBe(400);
    expect(handleUserDeletedMock).not.toHaveBeenCalled();
  });

  it("processes a verified user.created event", async () => {
    const response = await POST(
      buildRequest({
        payload: userCreatedPayload,
        signature: sign(userCreatedPayload),
      }),
    );

    expect(response.status).toBe(200);
    expect(handleUserCreatedMock).toHaveBeenCalledWith(
      {
        email: "new@example.com",
        firstName: "New",
        lastName: "User",
        userId: "user_clerk_1",
        imageUrl: "https://example.com/avatar.png",
        signupMethod: "google",
      },
      { db: expect.anything() },
    );
    expect(handleUserDeletedMock).not.toHaveBeenCalled();
  });

  it("processes a verified user.deleted event", async () => {
    const response = await POST(
      buildRequest({
        payload: userDeletedPayload,
        signature: sign(userDeletedPayload),
      }),
    );

    expect(response.status).toBe(200);
    expect(handleUserDeletedMock).toHaveBeenCalledWith(
      { userId: "user_clerk_1" },
      { db: expect.anything() },
    );
  });
});
