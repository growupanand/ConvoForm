import { describe, expect, it } from "bun:test";
import {
  UnsafeWebhookUrlError,
  assertSafeAiBaseUrl,
  assertSafeWebhookUrl,
  isBlockedIpAddress,
} from "./ssrf";

const publicResolver = async () => ["93.184.216.34"];

function expectUnsafe(url: string, options = {}) {
  return expect(
    assertSafeWebhookUrl(url, {
      resolver: publicResolver,
      allowHttpLocalhost: false,
      ...options,
    }),
  ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
}

describe("assertSafeWebhookUrl", () => {
  it("allows an https URL that resolves to a public IPv4 address", async () => {
    const url = await assertSafeWebhookUrl("https://example.com/hooks/in", {
      resolver: publicResolver,
      allowHttpLocalhost: false,
    });

    expect(url.toString()).toBe("https://example.com/hooks/in");
  });

  it("allows a public IPv6 address", async () => {
    await expect(
      assertSafeWebhookUrl("https://[2001:4860:4860::8888]/hook", {
        allowHttpLocalhost: false,
      }),
    ).resolves.toBeInstanceOf(URL);
  });

  it("rejects credentials in the URL", async () => {
    await expectUnsafe("https://user:pass@example.com/hook");
  });

  it("rejects non-http(s) protocols", async () => {
    await expectUnsafe("ftp://example.com/hook");
  });

  it("rejects non-default https ports", async () => {
    await expectUnsafe("https://example.com:8443/hook");
  });

  it("rejects http outside development", async () => {
    await expectUnsafe("http://localhost/hook", {
      allowHttpLocalhost: false,
    });
    await expectUnsafe("http://example.com/hook", {
      allowHttpLocalhost: true,
    });
  });

  it("allows http localhost only in development on port 80", async () => {
    await expect(
      assertSafeWebhookUrl("http://localhost/hook", {
        allowHttpLocalhost: true,
      }),
    ).resolves.toBeInstanceOf(URL);

    await expect(
      assertSafeWebhookUrl("http://127.0.0.1/hook", {
        allowHttpLocalhost: true,
      }),
    ).resolves.toBeInstanceOf(URL);

    await expectUnsafe("http://localhost:8080/hook", {
      allowHttpLocalhost: true,
    });
  });

  it("rejects https localhost outside development and allows it in development", async () => {
    await expectUnsafe("https://localhost/hook", {
      allowHttpLocalhost: false,
    });

    await expect(
      assertSafeWebhookUrl("https://localhost/hook", {
        allowHttpLocalhost: true,
      }),
    ).resolves.toBeInstanceOf(URL);
  });

  it("rejects a hostname that resolves to a private address", async () => {
    await expectUnsafe("https://internal.example.com/hook", {
      resolver: async () => ["10.0.0.5"],
    });
  });

  it("rejects when any resolved address is blocked", async () => {
    await expectUnsafe("https://mixed.example.com/hook", {
      resolver: async () => ["93.184.216.34", "192.168.1.10"],
    });
  });

  it("rejects when the hostname does not resolve", async () => {
    await expectUnsafe("https://missing.example.com/hook", {
      resolver: async () => [],
    });
  });

  const blockedIpv4 = [
    "0.0.0.0",
    "0.1.2.3",
    "10.0.0.1",
    "10.255.255.255",
    "100.64.0.1",
    "100.127.255.255",
    "127.0.0.1",
    "127.255.255.255",
    "169.254.169.254",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.0.1",
    "192.168.255.255",
    "224.0.0.1",
    "239.255.255.255",
    "255.255.255.255",
  ];

  for (const address of blockedIpv4) {
    it(`rejects ${address}`, async () => {
      expect(isBlockedIpAddress(address)).toBe(true);
      await expectUnsafe(`https://${address}/hook`);
    });
  }

  const blockedIpv6 = [
    "::",
    "::1",
    "fc00::1",
    "fd12:3456:789a::1",
    "fe80::1",
    "ff02::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "::ffff:169.254.169.254",
  ];

  for (const address of blockedIpv6) {
    it(`rejects ${address}`, async () => {
      expect(isBlockedIpAddress(address)).toBe(true);
      await expectUnsafe(`https://[${address}]/hook`);
    });
  }

  it("does not block public addresses", () => {
    expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
    expect(isBlockedIpAddress("93.184.216.34")).toBe(false);
    expect(isBlockedIpAddress("2001:4860:4860::8888")).toBe(false);
    expect(isBlockedIpAddress("::ffff:8.8.8.8")).toBe(false);
  });
});

describe("assertSafeAiBaseUrl", () => {
  const options = {
    resolver: publicResolver,
    allowHttpLocalhost: false,
  };

  it("allows a public https base URL", async () => {
    await expect(
      assertSafeAiBaseUrl("https://api.example.ai/v1", options),
    ).resolves.toBeInstanceOf(URL);
  });

  it("rejects http even when it is a public host", async () => {
    await expect(
      assertSafeAiBaseUrl("http://api.example.ai/v1", options),
    ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
  });

  it("rejects non-standard ports", async () => {
    await expect(
      assertSafeAiBaseUrl("https://api.example.ai:8443/v1", options),
    ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
  });

  it("rejects private and metadata addresses", async () => {
    await expect(
      assertSafeAiBaseUrl("https://10.0.0.5/v1", options),
    ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
    await expect(
      assertSafeAiBaseUrl("https://169.254.169.254/latest/meta-data", options),
    ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
  });

  it("rejects a hostname that resolves to a private address", async () => {
    await expect(
      assertSafeAiBaseUrl("https://internal.example.ai/v1", {
        ...options,
        resolver: async () => ["192.168.1.10"],
      }),
    ).rejects.toBeInstanceOf(UnsafeWebhookUrlError);
  });

  it("uses AI-specific wording in errors", async () => {
    await expect(
      assertSafeAiBaseUrl("http://api.example.ai/v1", options),
    ).rejects.toThrow("AI provider base URL");
  });
});
