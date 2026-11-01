/**
 * Beta feature limits configuration.
 *
 * Kept in a constants-only module so client-safe consumers can import the
 * limits without pulling in the storage service (R2/S3) code.
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
