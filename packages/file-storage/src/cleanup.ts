import { and, count, eq, lt, sum } from "@convoform/db";
import { db } from "@convoform/db/src/db";
import { fileUpload } from "@convoform/db/src/schema";
import { fileStorageService } from "./service";

/**
 * Cleanup service for handling file retention and expired file deletion
 */
export class FileCleanupService {
  /**
   * Delete all expired files that have passed their retention period
   * This should be run as a scheduled job (e.g., daily cron job)
   */
  async cleanupExpiredFiles(): Promise<{
    deletedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let deletedCount = 0;

    try {
      // Find all files that have expired and are not already marked as deleted
      const expiredFiles = await db.query.fileUpload.findMany({
        where: and(
          lt(fileUpload.expiresAt, new Date()),
          eq(fileUpload.isDeleted, false),
        ),
        columns: {
          id: true,
          storedPath: true,
          originalName: true,
          organizationId: true,
        },
      });

      console.log(`Found ${expiredFiles.length} expired files to clean up`);

      for (const file of expiredFiles) {
        try {
          // Mark file as deleted in database first
          const [updatedFile] = await db
            .update(fileUpload)
            .set({
              isDeleted: true,
              updatedAt: new Date(),
            })
            .where(eq(fileUpload.id, file.id))
            .returning();

          if (updatedFile) {
            // Try to delete from R2 storage
            try {
              await fileStorageService.deleteFile(file.storedPath);
              deletedCount++;
              console.log(
                `Successfully deleted expired file: ${file.originalName} (${file.id})`,
              );
            } catch (storageError) {
              const errorMsg = `Failed to delete file from storage: ${file.originalName} (${file.id}) - ${storageError instanceof Error ? storageError.message : "Unknown error"}`;
              console.error(errorMsg);
              errors.push(errorMsg);
              // File is marked as deleted in DB, so this is not critical
            }
          } else {
            const errorMsg = `Failed to mark file as deleted in database: ${file.id}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        } catch (fileError) {
          const errorMsg = `Error processing file ${file.id}: ${fileError instanceof Error ? fileError.message : "Unknown error"}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(
        `Cleanup completed. Deleted ${deletedCount} files with ${errors.length} errors`,
      );

      return {
        deletedCount,
        errors,
      };
    } catch (error) {
      const errorMsg = `Critical error during file cleanup: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      errors.push(errorMsg);

      return {
        deletedCount,
        errors,
      };
    }
  }

  /**
   * Delete files that are marked as deleted but still exist in storage
   * This is a safety cleanup for any files that failed to delete from storage
   */
  async cleanupOrphanedFiles(): Promise<{
    checkedCount: number;
    deletedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let checkedCount = 0;
    let deletedCount = 0;

    try {
      // Find files marked as deleted in the database
      const deletedFiles = await db.query.fileUpload.findMany({
        where: eq(fileUpload.isDeleted, true),
        columns: {
          id: true,
          storedPath: true,
          originalName: true,
        },
      });

      console.log(
        `Found ${deletedFiles.length} deleted files to check for orphaned storage`,
      );

      for (const file of deletedFiles) {
        try {
          checkedCount++;

          // Check if file still exists in storage
          const exists = await fileStorageService.fileExists(file.storedPath);

          if (exists) {
            // File exists in storage but is marked as deleted - remove it
            try {
              await fileStorageService.deleteFile(file.storedPath);
              deletedCount++;
              console.log(
                `Cleaned up orphaned file: ${file.originalName} (${file.id})`,
              );
            } catch (deleteError) {
              const errorMsg = `Failed to delete orphaned file: ${file.originalName} (${file.id}) - ${deleteError instanceof Error ? deleteError.message : "Unknown error"}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        } catch (checkError) {
          const errorMsg = `Error checking file ${file.id}: ${checkError instanceof Error ? checkError.message : "Unknown error"}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(
        `Orphaned file cleanup completed. Checked ${checkedCount} files, deleted ${deletedCount} orphaned files with ${errors.length} errors`,
      );

      return {
        checkedCount,
        deletedCount,
        errors,
      };
    } catch (error) {
      const errorMsg = `Critical error during orphaned file cleanup: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      errors.push(errorMsg);

      return {
        checkedCount,
        deletedCount,
        errors,
      };
    }
  }

  /**
   * Get statistics about files pending cleanup
   */
  async getCleanupStats(): Promise<{
    expiredFiles: number;
    deletedFiles: number;
    totalActiveFiles: number;
    totalStorageUsed: number;
  }> {
    try {
      // Count expired files
      const expiredFiles = await db
        .select({ count: count() })
        .from(fileUpload)
        .where(
          and(
            lt(fileUpload.expiresAt, new Date()),
            eq(fileUpload.isDeleted, false),
          ),
        );

      // Count deleted files
      const deletedFiles = await db
        .select({ count: count() })
        .from(fileUpload)
        .where(eq(fileUpload.isDeleted, true));

      // Count active files and total storage
      const activeFiles = await db
        .select({
          count: count(),
          totalSize: sum(fileUpload.fileSize),
        })
        .from(fileUpload)
        .where(eq(fileUpload.isDeleted, false));

      return {
        expiredFiles: Number(expiredFiles[0]?.count || 0),
        deletedFiles: Number(deletedFiles[0]?.count || 0),
        totalActiveFiles: Number(activeFiles[0]?.count || 0),
        totalStorageUsed: Number(activeFiles[0]?.totalSize || 0),
      };
    } catch (error) {
      console.error("Error getting cleanup stats:", error);
      return {
        expiredFiles: 0,
        deletedFiles: 0,
        totalActiveFiles: 0,
        totalStorageUsed: 0,
      };
    }
  }
}

/**
 * Default cleanup service instance
 */
export const fileCleanupService = new FileCleanupService();

/**
 * Convenience function to run the complete cleanup process
 */
export async function runFileCleanup(): Promise<{
  expiredCleanup: Awaited<
    ReturnType<FileCleanupService["cleanupExpiredFiles"]>
  >;
  orphanedCleanup: Awaited<
    ReturnType<FileCleanupService["cleanupOrphanedFiles"]>
  >;
}> {
  console.log("Starting file cleanup process...");

  const expiredCleanup = await fileCleanupService.cleanupExpiredFiles();
  const orphanedCleanup = await fileCleanupService.cleanupOrphanedFiles();

  console.log("File cleanup process completed");

  return {
    expiredCleanup,
    orphanedCleanup,
  };
}
