import { BETA_LIMITS } from "./config";

/**
 * Utility functions for file storage operations
 */

/**
 * Check if file type is allowed
 */
export function isFileTypeAllowed(mimeType: string): boolean {
  return BETA_LIMITS.ALLOWED_MIME_TYPES.includes(mimeType as any);
}

/**
 * Check if file extension is allowed
 */
export function isFileExtensionAllowed(fileName: string): boolean {
  const extension = `.${fileName.split(".").pop()?.toLowerCase()}`;
  return BETA_LIMITS.ALLOWED_EXTENSIONS.includes(extension as any);
}

/**
 * Get allowed file types for HTML input accept attribute
 */
export function getAcceptAttribute(): string {
  return BETA_LIMITS.ALLOWED_EXTENSIONS.join(",");
}

/**
 * Validate file name (no special characters, proper length)
 */
export function validateFileName(fileName: string): {
  isValid: boolean;
  error?: string;
} {
  if (!fileName || fileName.trim().length === 0) {
    return { isValid: false, error: "File name cannot be empty" };
  }

  if (fileName.length > 255) {
    return { isValid: false, error: "File name too long (max 255 characters)" };
  }

  // Check for dangerous characters
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    return { isValid: false, error: "File name contains invalid characters" };
  }

  // Check if extension is valid
  if (!isFileExtensionAllowed(fileName)) {
    const allowedExts = BETA_LIMITS.ALLOWED_EXTENSIONS.join(", ");
    return {
      isValid: false,
      error: `File extension not allowed. Allowed: ${allowedExts}`,
    };
  }

  return { isValid: true };
}

/**
 * Calculate storage usage percentage
 */
export function calculateStorageUsagePercent(usedBytes: number): number {
  return Math.round((usedBytes / BETA_LIMITS.MAX_STORAGE_PER_ORG) * 100);
}

/**
 * Check if organization has enough storage space
 */
export function hasStorageSpace(
  currentUsage: number,
  newFileSize: number,
): boolean {
  return currentUsage + newFileSize <= BETA_LIMITS.MAX_STORAGE_PER_ORG;
}

/**
 * Calculate bandwidth usage percentage for the month
 */
export function calculateBandwidthUsagePercent(usedBytes: number): number {
  return Math.round((usedBytes / BETA_LIMITS.MAX_BANDWIDTH_PER_MONTH) * 100);
}

/**
 * Check if organization has enough bandwidth for download
 */
export function hasBandwidthQuota(
  currentUsage: number,
  downloadSize: number,
): boolean {
  return currentUsage + downloadSize <= BETA_LIMITS.MAX_BANDWIDTH_PER_MONTH;
}
