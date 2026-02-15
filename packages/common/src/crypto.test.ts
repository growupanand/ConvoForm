import { describe, expect, it } from "vitest";
import { decrypt, encrypt, signPayload, verifySignature } from "./crypto";

describe("Crypto Utils", () => {
  const secretKey = "super-secret-key-123";
  const message = "Hello, World!";

  describe("encrypt/decrypt", () => {
    it("should encrypt and decrypt a message correctly", async () => {
      const encrypted = await encrypt(message, secretKey);
      expect(encrypted).not.toBe(message);
      expect(encrypted).toContain(":"); // Checks for IV:Ciphertext format

      const decrypted = await decrypt(encrypted, secretKey);
      expect(decrypted).toBe(message);
    });

    it("should fail to decrypt with wrong key", async () => {
      const encrypted = await encrypt(message, secretKey);
      const wrongKey = "wrong-secure-key-456";

      // AES-GCM decryption fails if the key is incorrect (integrity check)
      await expect(decrypt(encrypted, wrongKey)).rejects.toThrow();
    });

    it("should throw error for invalid encrypted format", async () => {
      await expect(decrypt("invalid-string", secretKey)).rejects.toThrow(
        "Invalid encrypted text format",
      );
    });
  });

  describe("sign/verify", () => {
    it("should sign and verify a payload correctly", async () => {
      const signature = await signPayload(message, secretKey);
      const isValid = await verifySignature(message, signature, secretKey);
      expect(isValid).toBe(true);
    });

    it("should fail verification for tampered payload", async () => {
      const signature = await signPayload(message, secretKey);
      const isValid = await verifySignature(
        `${message}tampered`,
        signature,
        secretKey,
      );
      expect(isValid).toBe(false);
    });
    it("should fail verification for wrong signature", async () => {
      const signature = await signPayload(message, secretKey);
      const isValid = await verifySignature(
        message,
        `${signature}tampered`,
        secretKey,
      );
      expect(isValid).toBe(false);
    });
  });
});
