import { describe, expect, it, mock } from "bun:test";
import { BETA_LIMITS } from "@convoform/file-storage/constants";

// The app router pulls in file storage, which is server-only and requires R2
// configuration at import time. Stub it so this test can inspect the router.
mock.module("@convoform/file-storage", () => ({
  BETA_LIMITS,
  fileStorageService: {},
}));

process.env.DATABASE_URL = "postgresql://localhost/test";
process.env.CLERK_SECRET_KEY = "test";
process.env.ENCRYPTION_KEY = "test";
process.env.INTERNAL_EMAIL_API_SECRET = "test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.AI_API_KEY = "test";
process.env.CONVERSATION_MODEL = "groq:openai/gpt-oss-120b";
process.env.RESEND_API_KEY = "test";
process.env.EMAIL_FROM = "test@example.com";

const { appRouter } = await import("../src/router/root");

describe("appRouter webhook exposure", () => {
  it("does not expose Clerk webhook handlers through tRPC", () => {
    const procedures = Object.keys(appRouter._def.procedures);

    expect(
      procedures.filter(
        (procedure) =>
          procedure === "webhook" || procedure.startsWith("webhook."),
      ),
    ).toEqual([]);
    expect(Object.keys(appRouter._def.record)).not.toContain("webhook");
  });
});
