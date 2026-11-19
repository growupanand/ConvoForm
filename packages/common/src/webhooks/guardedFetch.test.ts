import { describe, expect, it } from "bun:test";
import { createGuardedFetch } from "./guardedFetch";
import { UnsafeWebhookUrlError } from "./ssrf";

const publicResolver = async () => ["93.184.216.34"];

describe("createGuardedFetch", () => {
  it("checks every request before calling the underlying fetch", async () => {
    let called = false;
    const guardedFetch = createGuardedFetch({
      resolver: publicResolver,
      allowHttpLocalhost: false,
      fetch: async () => {
        called = true;
        return new Response("ok");
      },
    });

    await guardedFetch("https://api.example.ai/v1/models");

    expect(called).toBe(true);
  });

  it("rejects private addresses without calling the underlying fetch", async () => {
    let called = false;
    const guardedFetch = createGuardedFetch({
      resolver: async () => ["10.0.0.5"],
      allowHttpLocalhost: false,
      fetch: async () => {
        called = true;
        return new Response("ok");
      },
    });

    await expect(
      guardedFetch("https://internal.example.ai/v1/models"),
    ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
    expect(called).toBe(false);
  });

  it("rejects http URLs", async () => {
    let called = false;
    const guardedFetch = createGuardedFetch({
      resolver: publicResolver,
      allowHttpLocalhost: false,
      fetch: async () => {
        called = true;
        return new Response("ok");
      },
    });

    await expect(
      guardedFetch("http://api.example.ai/v1/models"),
    ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
    expect(called).toBe(false);
  });

  it("does not follow redirects", async () => {
    const guardedFetch = createGuardedFetch({
      resolver: publicResolver,
      allowHttpLocalhost: false,
      fetch: async (_input, init) => {
        expect(init?.redirect).toBe("manual");
        return new Response(null, {
          status: 302,
          headers: { location: "https://169.254.169.254/latest/meta-data" },
        });
      },
    });

    await expect(
      guardedFetch("https://api.example.ai/v1/models"),
    ).rejects.toThrow("must not redirect");
  });

  it("accepts URL and Request inputs", async () => {
    const guardedFetch = createGuardedFetch({
      resolver: publicResolver,
      allowHttpLocalhost: false,
      fetch: async () => new Response("ok"),
    });

    await expect(
      guardedFetch(new URL("https://api.example.ai/v1/models")),
    ).resolves.toBeInstanceOf(Response);
    await expect(
      guardedFetch(new Request("https://api.example.ai/v1/models")),
    ).resolves.toBeInstanceOf(Response);
  });
});
