import { describe, expect, it } from "bun:test";
import {
  AiCredentialCryptoError,
  decryptAiCredentialSecret,
  encryptAiCredentialSecret,
  getAiCredentialLast4,
  rewrapAiCredentialSecret,
} from "./aiCredentialCrypto";

const organizationId = "org_123";
const provider = "openai";
const secret = "sk-live-abcdefghijklmnopqrstuvwxyz";

function makeMasterKey(byte: number): string {
  const bytes = new Uint8Array(32).fill(byte);
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

const masterKeyV1 = makeMasterKey(1);
const masterKeyV2 = makeMasterKey(2);

async function encrypt(
  overrides: Partial<Parameters<typeof encryptAiCredentialSecret>[0]> = {},
) {
  return encryptAiCredentialSecret({
    secret,
    organizationId,
    provider,
    masterKey: masterKeyV1,
    keyVersion: 1,
    ...overrides,
  });
}

describe("aiCredentialCrypto", () => {
  describe("encrypt/decrypt", () => {
    it("round trips a secret and never stores it in plaintext", async () => {
      const ciphertext = await encrypt();

      expect(ciphertext.encryptedSecret).not.toContain(secret);
      expect(ciphertext.wrappedDataKey).not.toContain(secret);
      expect(ciphertext.keyVersion).toBe(1);
      expect(ciphertext.encryptedSecret).not.toBe(secret);

      const decrypted = await decryptAiCredentialSecret({
        ciphertext,
        organizationId,
        provider,
        masterKey: masterKeyV1,
      });

      expect(decrypted).toBe(secret);
    });

    it("accepts a 64-character hex master key", async () => {
      const hexMasterKey = "ab".repeat(32);
      const ciphertext = await encrypt({ masterKey: hexMasterKey });

      await expect(
        decryptAiCredentialSecret({
          ciphertext,
          organizationId,
          provider,
          masterKey: hexMasterKey,
        }),
      ).resolves.toBe(secret);
    });

    it("returns only the last four characters for display", () => {
      expect(getAiCredentialLast4(secret)).toBe("wxyz");
    });

    it("fails when the ciphertext is copied to another organization", async () => {
      const ciphertext = await encrypt();

      await expect(
        decryptAiCredentialSecret({
          ciphertext,
          organizationId: "org_other",
          provider,
          masterKey: masterKeyV1,
        }),
      ).rejects.toBeInstanceOf(AiCredentialCryptoError);
    });

    it("fails when the ciphertext is copied to another provider", async () => {
      const ciphertext = await encrypt();

      await expect(
        decryptAiCredentialSecret({
          ciphertext,
          organizationId,
          provider: "anthropic",
          masterKey: masterKeyV1,
        }),
      ).rejects.toBeInstanceOf(AiCredentialCryptoError);
    });

    it("fails when the encrypted secret is tampered with", async () => {
      const ciphertext = await encrypt();
      const bytes = atob(ciphertext.encryptedSecret).split("");
      bytes[0] = String.fromCharCode((bytes[0]?.charCodeAt(0) ?? 0) ^ 0xff);

      await expect(
        decryptAiCredentialSecret({
          ciphertext: {
            ...ciphertext,
            encryptedSecret: btoa(bytes.join("")),
          },
          organizationId,
          provider,
          masterKey: masterKeyV1,
        }),
      ).rejects.toBeInstanceOf(AiCredentialCryptoError);
    });

    it("fails when the wrapped data key is tampered with", async () => {
      const ciphertext = await encrypt();
      const [formatVersion, iv, wrappedKey = ""] =
        ciphertext.wrappedDataKey.split(".");
      const bytes = atob(wrappedKey).split("");
      bytes[0] = String.fromCharCode((bytes[0]?.charCodeAt(0) ?? 0) ^ 0xff);

      await expect(
        decryptAiCredentialSecret({
          ciphertext: {
            ...ciphertext,
            wrappedDataKey: `${formatVersion}.${iv}.${btoa(bytes.join(""))}`,
          },
          organizationId,
          provider,
          masterKey: masterKeyV1,
        }),
      ).rejects.toBeInstanceOf(AiCredentialCryptoError);
    });

    it("fails with the wrong master key", async () => {
      const ciphertext = await encrypt();

      await expect(
        decryptAiCredentialSecret({
          ciphertext,
          organizationId,
          provider,
          masterKey: masterKeyV2,
        }),
      ).rejects.toBeInstanceOf(AiCredentialCryptoError);
    });

    it("fails with an unsupported format version", async () => {
      const ciphertext = await encrypt();

      await expect(
        decryptAiCredentialSecret({
          ciphertext: { ...ciphertext, wrappedDataKey: "99.a.b" },
          organizationId,
          provider,
          masterKey: masterKeyV1,
        }),
      ).rejects.toThrow("Unsupported AI credential encryption format");
    });

    it("never includes the secret in an error message", async () => {
      const ciphertext = await encrypt();

      try {
        await decryptAiCredentialSecret({
          ciphertext,
          organizationId: "org_other",
          provider,
          masterKey: masterKeyV1,
        });
        throw new Error("expected decryption to fail");
      } catch (error) {
        expect(`${error}`).not.toContain(secret);
        expect((error as Error).message).not.toContain(secret);
      }
    });

    it("rejects an invalid master key without echoing it", async () => {
      const shortKey = "not-a-valid-master-key";

      try {
        await encrypt({ masterKey: shortKey });
        throw new Error("expected encryption to fail");
      } catch (error) {
        expect((error as Error).message).toBe(
          "AI credential master key must be 32 bytes",
        );
        expect((error as Error).message).not.toContain(shortKey);
      }
    });

    it("rejects invalid key versions", async () => {
      await expect(encrypt({ keyVersion: 0 })).rejects.toThrow(
        "Invalid AI credential key version",
      );
    });
  });

  describe("rewrap", () => {
    it("moves a data key to a new master key version", async () => {
      const original = await encrypt();

      const rewrapped = await rewrapAiCredentialSecret({
        ciphertext: original,
        organizationId,
        provider,
        sourceMasterKey: masterKeyV1,
        targetMasterKey: masterKeyV2,
        targetKeyVersion: 2,
      });

      expect(rewrapped.keyVersion).toBe(2);
      expect(rewrapped.encryptedSecret).toBe(original.encryptedSecret);
      expect(rewrapped.iv).toBe(original.iv);
      expect(rewrapped.wrappedDataKey).not.toBe(original.wrappedDataKey);

      await expect(
        decryptAiCredentialSecret({
          ciphertext: rewrapped,
          organizationId,
          provider,
          masterKey: masterKeyV2,
        }),
      ).resolves.toBe(secret);

      // The old record still decrypts while the old master key is available.
      await expect(
        decryptAiCredentialSecret({
          ciphertext: original,
          organizationId,
          provider,
          masterKey: masterKeyV1,
        }),
      ).resolves.toBe(secret);
    });

    it("does not decrypt a rewrapped record with the old master key", async () => {
      const original = await encrypt();
      const rewrapped = await rewrapAiCredentialSecret({
        ciphertext: original,
        organizationId,
        provider,
        sourceMasterKey: masterKeyV1,
        targetMasterKey: masterKeyV2,
        targetKeyVersion: 2,
      });

      await expect(
        decryptAiCredentialSecret({
          ciphertext: rewrapped,
          organizationId,
          provider,
          masterKey: masterKeyV1,
        }),
      ).rejects.toBeInstanceOf(AiCredentialCryptoError);
    });

    it("binds the rewrap to the organization and provider", async () => {
      const original = await encrypt();

      await expect(
        rewrapAiCredentialSecret({
          ciphertext: original,
          organizationId: "org_other",
          provider,
          sourceMasterKey: masterKeyV1,
          targetMasterKey: masterKeyV2,
          targetKeyVersion: 2,
        }),
      ).rejects.toBeInstanceOf(AiCredentialCryptoError);
    });
  });
});
