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
import { formatFileSize } from "@convoform/common";
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

  const getFileIcon = (mimeType: string, className?: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <FileImage
          className={cn("h-4 w-4 text-blue-500 inline align-middle", className)}
        />
      );
    }
    if (mimeType === "application/pdf") {
      return (
        <FileText
          className={cn("h-4 w-4 text-red-500 inline align-middle", className)}
        />
      );
    }
    return (
      <File
        className={cn("h-4 w-4 text-gray-500 inline align-middle", className)}
      />
    );
  };

  const isExpired =
    fileMetadata.expiresAt && new Date(fileMetadata.expiresAt) < new Date();

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-baseline gap-2 w-full cursor-pointer hover:bg-accent/50 rounded-md p-1 transition-colors">
            <div className="flex-shrink-0">
              {getFileIcon(fileMetadata.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">
                {fileMetadata.originalName}
              </p>
              {isExpired && <p className="text-xs text-destructive">Expired</p>}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <div className="space-y-4">
            <div className="flex justify-start items-baseline gap-2">
              <div>{getFileIcon(fileMetadata.mimeType, "size-6")}</div>
              <h4 className="font-medium text-lg leading-tight mx-auto break-all line-clamp-2">
                {fileMetadata.originalName}
              </h4>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                <span className="text-subtle-foreground text-right">Size:</span>
                <span className="font-medium">
                  {formatFileSize(fileMetadata.fileSize)}
                </span>

                <span className="text-subtle-foreground text-right">Type:</span>
                <span className="font-medium truncate">
                  {fileMetadata.mimeType}
                </span>

                <span className="text-subtle-foreground text-right">
                  Downloads:
                </span>
                <span className="font-medium">
                  {fileMetadata.downloadCount}{" "}
                  {fileMetadata.downloadCount === 1 ? "time" : "times"}
                </span>

                <span className="text-subtle-foreground text-right">
                  Uploaded:
                </span>
                <span className="font-medium">
                  {new Date(fileMetadata.uploadedAt).toLocaleDateString()}
                </span>

                {fileMetadata.expiresAt && (
                  <>
                    <span className="text-subtle-foreground text-right">
                      Expires:
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        isExpired ? "text-destructive" : "",
                      )}
                    >
                      {new Date(fileMetadata.expiresAt).toLocaleDateString()}
                      {isExpired && " (Expired)"}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={handleDownload}
              disabled={isDownloading || isExpired}
              className="w-full gap-2"
            >
              {isDownloading ? (
                <Spinner size="sm" />
              ) : (
                <Download className="size-4" />
              )}
              Download
            </Button>
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
