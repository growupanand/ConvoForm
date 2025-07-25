import { S3Client } from "@aws-sdk/client-s3";
import { getR2Config } from "./config";

let r2Client: S3Client | null = null;

/**
 * Get or create a Cloudflare R2 client instance
 * Uses AWS S3 SDK for compatibility with R2
 */
export function getR2Client(): S3Client {
  if (!r2Client) {
    const config = getR2Config();

    r2Client = new S3Client({
      region: "auto", // R2 uses "auto" region
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

/**
 * Reset the R2 client instance (useful for testing)
 */
export function resetR2Client(): void {
  r2Client = null;
}
