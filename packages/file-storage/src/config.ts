import { z } from "zod/v4";

export { BETA_LIMITS } from "./constants";

/**
 * Environment configuration schema for Cloudflare R2 storage
 */
export const r2ConfigSchema = z.object({
  /** Cloudflare R2 Account ID */
  R2_ACCOUNT_ID: z.string().min(1),
  /** Cloudflare R2 Access Key ID */
  R2_ACCESS_KEY_ID: z.string().min(1),
  /** Cloudflare R2 Secret Access Key */
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  /** R2 Bucket Name for file uploads */
  R2_BUCKET_NAME: z.string().min(1),
  /** R2 Public Domain (optional, for direct file access) */
  R2_PUBLIC_DOMAIN: z.string().url().optional(),
});

export type R2Config = z.infer<typeof r2ConfigSchema>;

/**
 * Validates and returns R2 configuration from environment variables
 */
export function getR2Config(): R2Config {
  const config = {
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN,
  };

  try {
    return r2ConfigSchema.parse(config);
  } catch (error) {
    throw new Error(
      `Invalid R2 configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
