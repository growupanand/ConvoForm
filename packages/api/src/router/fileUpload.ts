import { and, eq, gte, lt, sql, sum } from "@convoform/db";
import { fileUpload } from "@convoform/db/src/schema";
import { featureFlagService } from "@convoform/feature-flags";
import { BETA_LIMITS, fileStorageService } from "@convoform/file-storage";
import { enforceRateLimit } from "@convoform/rate-limiter";
import { z } from "zod";

import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { createTRPCRouter } from "../trpc";

const uploadFileInputSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.enum(BETA_LIMITS.ALLOWED_MIME_TYPES),
  fileSize: z.number().min(1).max(BETA_LIMITS.MAX_FILE_SIZE),
  fileBuffer: z.string(), // Base64 encoded file data
  organizationId: z.string().min(1),
  formId: z.string().min(1),
  conversationId: z.string().optional(),
});

const getDownloadUrlInputSchema = z.object({
  fileId: z.string().min(1),
  organizationId: z.string().min(1),
});

const deleteFileInputSchema = z.object({
  fileId: z.string().min(1),
  organizationId: z.string().min(1),
});

export const fileUploadRouter = createTRPCRouter({
  // Upload a new file
  uploadFile: authProtectedProcedure
    .input(uploadFileInputSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit({
        identifier: ctx.userId,
        rateLimitType: "core:create",
      });

      // Check if file upload beta is enabled for this organization
      const isFileUploadEnabled = await featureFlagService.isFeatureEnabled(
        "file-upload-beta",
        {
          distinctId: ctx.userId,
          organizationId: input.organizationId,
          groupType: "organization",
          groupKey: input.organizationId,
        },
      );

      if (!isFileUploadEnabled) {
        throw new Error(
          "File upload feature is not available. Please contact support to enable beta access.",
        );
      }

      const {
        fileName,
        fileType,
        fileSize,
        fileBuffer,
        organizationId,
        formId,
        conversationId,
      } = input;

      // Verify organization ownership
      // const userOrg = await ctx.db.query.organization.findFirst({
      //   where: (org, { eq }) => eq(org.id, organizationId),
      //   columns: { id: true, name: true },
      // });

      // if (!userOrg) {
      //   throw new Error("Organization not found or access denied");
      // }

      // Check current organization storage usage
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const storageUsage = await ctx.db
        .select({
          totalSize: sum(fileUpload.fileSize),
        })
        .from(fileUpload)
        .where(
          and(
            eq(fileUpload.organizationId, organizationId),
            eq(fileUpload.isDeleted, false),
            gte(fileUpload.createdAt, currentMonth),
          ),
        );

      const currentStorageUsed = Number(storageUsage[0]?.totalSize || 0);

      // Check if adding this file would exceed storage limit
      if (currentStorageUsed + fileSize > BETA_LIMITS.MAX_STORAGE_PER_ORG) {
        const remainingStorage =
          BETA_LIMITS.MAX_STORAGE_PER_ORG - currentStorageUsed;
        throw new Error(
          `Storage limit exceeded. Organization has ${Math.round(remainingStorage / (1024 * 1024))}MB remaining of ${BETA_LIMITS.MAX_STORAGE_PER_ORG / (1024 * 1024)}MB limit.`,
        );
      }

      // Check files per response limit (if conversationId provided)
      if (conversationId) {
        const existingFiles = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(fileUpload)
          .where(
            and(
              eq(fileUpload.conversationId, conversationId),
              eq(fileUpload.isDeleted, false),
            ),
          );

        const fileCount = Number(existingFiles[0]?.count || 0);
        if (fileCount >= BETA_LIMITS.MAX_FILES_PER_RESPONSE) {
          throw new Error(
            `Maximum ${BETA_LIMITS.MAX_FILES_PER_RESPONSE} file(s) per response allowed.`,
          );
        }
      }

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(fileBuffer, "base64");

        // Upload to R2 storage
        const uploadResult = await fileStorageService.uploadFile({
          file: {
            name: fileName,
            type: fileType,
            size: fileSize,
            buffer: buffer,
          },
          organizationId,
          formId,
          conversationId,
        });

        // Save file metadata to database
        const [savedFileUpload] = await ctx.db
          .insert(fileUpload)
          .values({
            originalName: uploadResult.originalName,
            storedName: uploadResult.storedName,
            storedPath: uploadResult.storedPath,
            mimeType: uploadResult.mimeType,
            fileSize: uploadResult.fileSize,
            organizationId,
            formId,
            conversationId: conversationId || null,
            expiresAt: uploadResult.expiresAt,
            isDeleted: false,
            downloadCount: 0,
          })
          .returning();

        if (!savedFileUpload) {
          // If database save fails, try to clean up uploaded file
          try {
            await fileStorageService.deleteFile(uploadResult.storedPath);
          } catch (cleanupError) {
            console.error(
              "Failed to cleanup file after database error:",
              cleanupError,
            );
          }
          throw new Error("Failed to save file metadata");
        }

        ctx.analytics.track("fileUpload:create", {
          properties: {
            fileId: savedFileUpload.id,
            organizationId,
            formId,
            conversationId,
            fileSize,
            mimeType: fileType,
          },
        });

        return {
          fileId: savedFileUpload.id,
          fileName: savedFileUpload.originalName,
          fileSize: savedFileUpload.fileSize,
          mimeType: savedFileUpload.mimeType,
          uploadedAt: savedFileUpload.createdAt,
        };
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        throw new Error(
          `Failed to upload file: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`,
        );
      }
    }),

  // Get secure download URL for a file
  getDownloadUrl: authProtectedProcedure
    .input(getDownloadUrlInputSchema)
    .query(async ({ input, ctx }) => {
      const { fileId, organizationId } = input;

      // Find file and verify ownership
      const fileRecord = await ctx.db.query.fileUpload.findFirst({
        where: (file, { eq, and }) =>
          and(
            eq(file.id, fileId),
            eq(file.organizationId, organizationId),
            eq(file.isDeleted, false),
          ),
        columns: {
          id: true,
          storedPath: true,
          fileSize: true,
          expiresAt: true,
          downloadCount: true,
        },
      });

      if (!fileRecord) {
        throw new Error("File not found or access denied");
      }

      // Check if file has expired
      if (fileRecord.expiresAt && new Date() > fileRecord.expiresAt) {
        throw new Error("File has expired");
      }

      // Check organization bandwidth usage for current month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const bandwidthUsage = await ctx.db
        .select({
          totalDownloaded: sum(
            sql<number>`${fileUpload.fileSize} * ${fileUpload.downloadCount}`,
          ),
        })
        .from(fileUpload)
        .where(
          and(
            eq(fileUpload.organizationId, organizationId),
            gte(fileUpload.lastDownloadedAt, currentMonth),
            lt(fileUpload.lastDownloadedAt, nextMonth),
          ),
        );

      const currentBandwidthUsed = Number(
        bandwidthUsage[0]?.totalDownloaded || 0,
      );

      // Check if download would exceed bandwidth limit
      if (
        currentBandwidthUsed + fileRecord.fileSize >
        BETA_LIMITS.MAX_BANDWIDTH_PER_MONTH
      ) {
        const remainingBandwidth =
          BETA_LIMITS.MAX_BANDWIDTH_PER_MONTH - currentBandwidthUsed;
        throw new Error(
          `Bandwidth limit exceeded. Organization has ${Math.round(remainingBandwidth / (1024 * 1024))}MB remaining of ${BETA_LIMITS.MAX_BANDWIDTH_PER_MONTH / (1024 * 1024 * 1024)}GB monthly limit.`,
        );
      }

      try {
        // Generate secure download URL (valid for 15 minutes)
        const downloadUrl = await fileStorageService.getDownloadUrl({
          storedPath: fileRecord.storedPath,
          expiresInSeconds: 900, // 15 minutes
        });

        // Update download count and last downloaded timestamp
        await ctx.db
          .update(fileUpload)
          .set({
            downloadCount: fileRecord.downloadCount + 1,
            lastDownloadedAt: new Date(),
          })
          .where(eq(fileUpload.id, fileId));

        ctx.analytics.track("fileUpload:view", {
          properties: {
            fileId,
            organizationId,
            fileSize: fileRecord.fileSize,
          },
        });

        return {
          downloadUrl,
          expiresIn: 900, // seconds
        };
      } catch (error) {
        console.error("Failed to generate download URL:", error);
        throw new Error("Failed to generate download URL");
      }
    }),

  // Delete a file
  deleteFile: authProtectedProcedure
    .input(deleteFileInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { fileId, organizationId } = input;

      // Find file and verify ownership
      const fileRecord = await ctx.db.query.fileUpload.findFirst({
        where: (file, { eq, and }) =>
          and(
            eq(file.id, fileId),
            eq(file.organizationId, organizationId),
            eq(file.isDeleted, false),
          ),
        columns: {
          id: true,
          storedPath: true,
          originalName: true,
        },
      });

      if (!fileRecord) {
        throw new Error("File not found or access denied");
      }

      try {
        // Mark as deleted in database first
        const [deletedFile] = await ctx.db
          .update(fileUpload)
          .set({
            isDeleted: true,
            updatedAt: new Date(),
          })
          .where(eq(fileUpload.id, fileId))
          .returning();

        if (!deletedFile) {
          throw new Error("Failed to delete file record");
        }

        // Try to delete from R2 storage (non-blocking)
        fileStorageService.deleteFile(fileRecord.storedPath).catch((error) => {
          console.error("Failed to delete file from storage:", error);
          // File is marked as deleted in DB, so this is not critical
        });

        ctx.analytics.track("fileUpload:delete", {
          properties: {
            fileId,
            organizationId,
            fileName: fileRecord.originalName,
          },
        });

        return {
          success: true,
          message: "File deleted successfully",
        };
      } catch (error) {
        console.error("Failed to delete file:", error);
        throw new Error("Failed to delete file");
      }
    }),

  // Get organization file upload statistics
  getOrganizationStats: authProtectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const { organizationId } = input;

      // Verify organization ownership
      const userOrg = await ctx.db.query.organization.findFirst({
        where: (org, { eq }) => eq(org.id, organizationId),
        columns: { id: true },
      });

      if (!userOrg) {
        throw new Error("Organization not found or access denied");
      }

      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      // Get storage usage
      const storageStats = await ctx.db
        .select({
          totalFiles: sql<number>`count(*)`,
          totalSize: sum(fileUpload.fileSize),
        })
        .from(fileUpload)
        .where(
          and(
            eq(fileUpload.organizationId, organizationId),
            eq(fileUpload.isDeleted, false),
          ),
        );

      // Get bandwidth usage for current month
      const bandwidthStats = await ctx.db
        .select({
          totalDownloads: sum(fileUpload.downloadCount),
          totalBandwidth: sum(
            sql<number>`${fileUpload.fileSize} * ${fileUpload.downloadCount}`,
          ),
        })
        .from(fileUpload)
        .where(
          and(
            eq(fileUpload.organizationId, organizationId),
            gte(fileUpload.lastDownloadedAt, currentMonth),
          ),
        );

      const totalFiles = Number(storageStats[0]?.totalFiles || 0);
      const totalStorageUsed = Number(storageStats[0]?.totalSize || 0);
      const totalDownloads = Number(bandwidthStats[0]?.totalDownloads || 0);
      const totalBandwidthUsed = Number(bandwidthStats[0]?.totalBandwidth || 0);

      return {
        storage: {
          used: totalStorageUsed,
          limit: BETA_LIMITS.MAX_STORAGE_PER_ORG,
          usagePercent: Math.round(
            (totalStorageUsed / BETA_LIMITS.MAX_STORAGE_PER_ORG) * 100,
          ),
          fileCount: totalFiles,
        },
        bandwidth: {
          used: totalBandwidthUsed,
          limit: BETA_LIMITS.MAX_BANDWIDTH_PER_MONTH,
          usagePercent: Math.round(
            (totalBandwidthUsed / BETA_LIMITS.MAX_BANDWIDTH_PER_MONTH) * 100,
          ),
          downloadCount: totalDownloads,
        },
        limits: {
          maxFileSize: BETA_LIMITS.MAX_FILE_SIZE,
          maxFilesPerResponse: BETA_LIMITS.MAX_FILES_PER_RESPONSE,
          retentionDays: BETA_LIMITS.RETENTION_DAYS,
          allowedTypes: BETA_LIMITS.ALLOWED_MIME_TYPES,
        },
      };
    }),
});
