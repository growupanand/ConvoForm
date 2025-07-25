"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@convoform/ui";
import { Card, CardContent } from "@convoform/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { Download, File, FileImage, FileText } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import Spinner from "./common/spinner";

interface FileDisplayProps {
  fileId: string;
  className?: string;
}

export function FileDisplay({ fileId, className }: FileDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { organization } = useOrganization();

  const {
    data: fileMetadata,
    isLoading,
    error,
  } = api.fileUpload.getFileMetadata.useQuery(
    {
      fileId,
      organizationId: organization?.id || "",
    },
    {
      enabled: !!organization?.id && !!fileId,
    },
  );

  const downloadMutation = api.fileUpload.getDownloadUrl.useMutation({
    onSuccess: (data) => {
      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = fileMetadata?.originalName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("File download started");
    },
    onError: (error) => {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    },
    onSettled: () => {
      setIsDownloading(false);
    },
  });

  const handleDownload = () => {
    if (!organization?.id || !fileId) return;

    setIsDownloading(true);
    downloadMutation.mutate({
      fileId,
      organizationId: organization.id,
    });
  };

  if (isLoading) {
    return <FileDisplaySkeleton />;
  }

  if (error || !fileMetadata) {
    return (
      <Card className={`border-destructive/50 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-destructive">
            <File className="h-4 w-4" />
            <span className="text-sm">File not found or access denied</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <FileImage className="h-4 w-4 text-blue-500 inline align-middle" />
      );
    }
    if (mimeType === "application/pdf") {
      return <FileText className="h-4 w-4 text-red-500 inline align-middle" />;
    }
    return <File className="h-4 w-4 text-gray-500 inline align-middle" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const isExpired =
    fileMetadata.expiresAt && new Date(fileMetadata.expiresAt) < new Date();

  const truncateFilename = (filename: string, maxLength = 30) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split(".").pop();
    if (!extension) return filename; // Handle case where there's no extension
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
      0,
      maxLength - extension.length - 4,
    );
    return `${truncatedName}...${extension}`;
  };

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="xs" className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {getFileIcon(fileMetadata.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {truncateFilename(fileMetadata.originalName)}
              </p>
              {isExpired && <p className="text-xs text-destructive">Expired</p>}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <div className="space-y-4">
            <h4 className="font-medium">
              {getFileIcon(fileMetadata.mimeType)} {fileMetadata.originalName}
            </h4>
            <div className="space-y-1 text-sm text-subtle-foreground">
              <div>
                <span>Size:</span>{" "}
                <span className="font-medium">
                  {formatFileSize(fileMetadata.fileSize)}
                </span>
              </div>
              <div>
                <span>Type:</span>{" "}
                <span className="font-medium">{fileMetadata.mimeType}</span>
              </div>
              <div>
                <span>Downloads:</span>{" "}
                <span className="font-medium">
                  {fileMetadata.downloadCount}{" "}
                  {fileMetadata.downloadCount === 1 ? "time" : "times"}
                  {/* show download left */}
                </span>
              </div>
              <div>
                <span>Uploaded:</span>{" "}
                <span className="font-medium">
                  {new Date(fileMetadata.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              {fileMetadata.expiresAt && (
                <div>
                  <span>Expires:</span>{" "}
                  <span
                    className={cn(
                      "font-medium",
                      isExpired ? "text-destructive" : "",
                    )}
                  >
                    {new Date(fileMetadata.expiresAt).toLocaleDateString()}
                    {isExpired && " (Expired)"}
                  </span>
                </div>
              )}
            </div>
            <div className="!mt-4">
              <Button
                onClick={handleDownload}
                disabled={isDownloading || isExpired}
                className="flex-shrink-0 gap-2 w-full"
              >
                {isDownloading ? (
                  <Spinner size="sm" />
                ) : (
                  <Download className="size-4" />
                )}
                Download
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function FileDisplaySkeleton() {
  return (
    <div className="flex items-center gap-2 flex-1">
      <Skeleton className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

FileDisplay.Skeleton = FileDisplaySkeleton;
