"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { FileUploadInputConfigSchema } from "@convoform/db/src/schema";
import { Badge, Button } from "@convoform/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui";
import { toast } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useFormContext } from "../formContext";
import type { InputProps } from "./";

type Props = InputProps & {
  inputConfiguration: FileUploadInputConfigSchema;
};

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB",
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "application/pdf"].includes(file.type),
      "Only JPG, JPEG, and PDF files are allowed",
    )
    .optional(),
});

export type FormData = z.infer<typeof formSchema>;

export function FileUploadInput({
  inputConfiguration,
  submitAnswer,
}: Readonly<Props>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const formHook = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const { convoFormHook } = useFormContext();
  const { conversationId } = convoFormHook;

  const uploadFileMutation = api.fileUpload.uploadFile.useMutation({
    onSuccess: async (result: { fileId: string }) => {
      toast.success("File uploaded successfully!");
      // Submit the file ID as the answer to continue the conversation
      await submitAnswer(result.fileId);
      setSelectedFile(null);
      formHook.reset();
    },
    onError: (error: { message: string }) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFormSubmit = async (formData: FormData) => {
    if (!formData.file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!conversationId) {
      toast.error("Conversation not initialized");
      return;
    }

    // Convert File to buffer for API call
    const fileBuffer = await formData.file.arrayBuffer();
    const fileBufferString = Buffer.from(fileBuffer).toString("base64");

    uploadFileMutation.mutate({
      fileName: formData.file.name,
      fileSize: formData.file.size,
      fileType: formData.file.type as
        | "image/jpeg"
        | "image/jpg"
        | "application/pdf",
      fileBuffer: fileBufferString,
      conversationId: conversationId, // Required for public uploads
    });
  };

  const handleFileSelect = (file: File | undefined) => {
    setSelectedFile(file || null);
    formHook.setValue("file", file);
    if (file) {
      formHook.clearErrors("file");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    formHook.setValue("file", undefined);
    formHook.clearErrors("file");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Form {...formHook}>
      <form onSubmit={formHook.handleSubmit(handleFormSubmit)}>
        <div className="space-y-4">
          {inputConfiguration?.helpText && (
            <p className="text-sm text-muted-foreground mt-2">
              {inputConfiguration.helpText}
            </p>
          )}

          <FormField
            control={formHook.control}
            name="file"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="space-y-4">
                    {!selectedFile ? (
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                          dragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400",
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() =>
                          document.getElementById("file-input")?.click()
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            document.getElementById("file-input")?.click();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Drop your file here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Support for JPG, JPEG, and PDF files up to 5MB
                        </p>
                        <div className="flex justify-center gap-2">
                          <Badge variant="secondary">JPG</Badge>
                          <Badge variant="secondary">JPEG</Badge>
                          <Badge variant="secondary">PDF</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <input
                      id="file-input"
                      type="file"
                      accept=".jpg,.jpeg,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFileSelect(file);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Maximum file size: 5MB</p>
            <p>• Files are automatically deleted after 30 days</p>
            <p>• Only 1 file per response allowed during beta</p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-lg text-xl h-auto py-2 font-medium"
            disabled={!selectedFile || uploadFileMutation.isPending}
          >
            {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
