import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod/v4";
import { getR2Client } from "./client";
import { BETA_LIMITS, getR2Config } from "./config";

/**
 * File upload input schema
 */
export const fileUploadInputSchema = z.object({
  file: z.object({
    name: z.string().min(1).max(255),
    type: z.enum(BETA_LIMITS.ALLOWED_MIME_TYPES),
    size: z.number().min(1).max(BETA_LIMITS.MAX_FILE_SIZE),
    buffer: z.instanceof(Buffer),
  }),
  organizationId: z.string().min(1),
  formId: z.string().min(1),
  conversationId: z.string().optional(),
});

export type FileUploadInput = z.infer<typeof fileUploadInputSchema>;

/**
 * File upload result
 */
export interface FileUploadResult {
  fileId: string;
  originalName: string;
  storedName: string;
  storedPath: string;
  mimeType: string;
  fileSize: number;
  expiresAt: Date;
}

/**
 * File download input schema
 */
export const fileDownloadInputSchema = z.object({
  storedPath: z.string().min(1),
  expiresInSeconds: z.number().min(1).max(3600).default(900), // Default 15 minutes
});

export type FileDownloadInput = z.infer<typeof fileDownloadInputSchema>;

/**
 * File storage service for handling uploads and downloads
 */
export class FileStorageService {
  private client = getR2Client();
  private config = getR2Config();

  /**
   * Generate a unique file name to prevent conflicts
   */
  private generateStoredName(
    originalName: string,
    organizationId: string,
    formId: string,
  ): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop()?.toLowerCase() || "";

    return `${organizationId}/${formId}/${timestamp}-${randomSuffix}.${extension}`;
  }

  /**
   * Generate expiry date (30 days from now)
   */
  private generateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + BETA_LIMITS.RETENTION_DAYS);
    return expiryDate;
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: FileUploadInput["file"]): void {
    // Check file size
    if (file.size > BETA_LIMITS.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds ${BETA_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      );
    }

    // Check MIME type
    if (!BETA_LIMITS.ALLOWED_MIME_TYPES.includes(file.type as any)) {
      throw new Error(
        `File type ${file.type} is not allowed. Allowed types: ${BETA_LIMITS.ALLOWED_MIME_TYPES.join(", ")}`,
      );
    }

    // Check file extension
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!BETA_LIMITS.ALLOWED_EXTENSIONS.includes(extension as any)) {
      throw new Error(
        `File extension ${extension} is not allowed. Allowed extensions: ${BETA_LIMITS.ALLOWED_EXTENSIONS.join(", ")}`,
      );
    }
  }

  /**
   * Upload a file to R2 storage
   */
  async uploadFile(input: FileUploadInput): Promise<FileUploadResult> {
    const validatedInput = fileUploadInputSchema.parse(input);

    // Validate file
    this.validateFile(validatedInput.file);

    // Generate unique file path
    const storedName = this.generateStoredName(
      validatedInput.file.name,
      validatedInput.organizationId,
      validatedInput.formId,
    );

    const storedPath = `uploads/${storedName}`;
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.config.R2_BUCKET_NAME,
        Key: storedPath,
        Body: validatedInput.file.buffer,
        ContentType: validatedInput.file.type,
        Metadata: {
          originalName: validatedInput.file.name,
          organizationId: validatedInput.organizationId,
          formId: validatedInput.formId,
          conversationId: validatedInput.conversationId || "",
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.client.send(command);

      return {
        fileId,
        originalName: validatedInput.file.name,
        storedName,
        storedPath,
        mimeType: validatedInput.file.type,
        fileSize: validatedInput.file.size,
        expiresAt: this.generateExpiryDate(),
      };
    } catch (error) {
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generate a signed download URL for a file
   */
  async getDownloadUrl(input: FileDownloadInput): Promise<string> {
    const validatedInput = fileDownloadInputSchema.parse(input);

    try {
      // Check if file exists
      const headCommand = new HeadObjectCommand({
        Bucket: this.config.R2_BUCKET_NAME,
        Key: validatedInput.storedPath,
      });

      await this.client.send(headCommand);

      // Extract filename from the stored path for Content-Disposition header
      const filename = validatedInput.storedPath.split("/").pop() || "download";

      // Generate signed URL with Content-Disposition header to force download
      const getCommand = new GetObjectCommand({
        Bucket: this.config.R2_BUCKET_NAME,
        Key: validatedInput.storedPath,
        ResponseContentDisposition: `attachment; filename="${filename}"`,
      });

      const signedUrl = await getSignedUrl(this.client, getCommand, {
        expiresIn: validatedInput.expiresInSeconds,
      });

      return signedUrl;
    } catch (error) {
      throw new Error(
        `Failed to generate download URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a file from R2 storage
   */
  async deleteFile(storedPath: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.R2_BUCKET_NAME,
        Key: storedPath,
      });

      await this.client.send(command);
    } catch (error) {
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Check if a file exists in storage
   */
  async fileExists(storedPath: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.R2_BUCKET_NAME,
        Key: storedPath,
      });

      await this.client.send(command);
      return true;
    } catch (_error) {
      return false;
    }
  }
}

/**
 * Default file storage service instance
 */
export const fileStorageService = new FileStorageService();
