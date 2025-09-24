import { z } from "zod/v4";

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

/**
 * Beta feature limits configuration
 */
export const BETA_LIMITS = {
  /** Maximum file size per upload (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Maximum files per response */
  MAX_FILES_PER_RESPONSE: 1,
  /** Maximum total storage per organization (100MB) */
  MAX_STORAGE_PER_ORG: 100 * 1024 * 1024,
  /** File retention period in days */
  RETENTION_DAYS: 30,
  /** Maximum download bandwidth per organization per month (1GB) */
  MAX_BANDWIDTH_PER_MONTH: 1 * 1024 * 1024 * 1024,
  /** Allowed MIME types */
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/jpg", "application/pdf"] as const,
  /** Allowed file extensions */
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".pdf"] as const,
} as const;
