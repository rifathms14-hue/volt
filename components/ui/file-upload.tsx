"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FileUploadProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

/**
 * Drag and Drop File Upload Component
 * Accepts files via drag-and-drop or click
 */
export function FileUpload({
  value,
  onChange,
  accept = ".pdf,.docx",
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type;

    const isValidType =
      acceptedTypes.includes(fileExtension) ||
      acceptedTypes.some((type) => {
        if (type === ".pdf") return fileType === "application/pdf";
        if (type === ".docx")
          return fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        return false;
      });

    if (!isValidType) {
      return `Only ${accept} files are allowed`;
    }

    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onChange?.(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onChange?.(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onChange?.(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  return (
    <div className={cn("w-full", className)}>
      {value ? (
        // File Preview
        <div className="flex items-center gap-3 p-4 border border-input rounded-md bg-background">
          <div className="flex-shrink-0">
            <File className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{value.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            className="h-8 w-8 flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        // Drag and Drop Zone
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "relative border-2 border-dashed rounded-md p-6 transition-colors cursor-pointer",
            "hover:border-primary/50 hover:bg-[#fafafa]",
            isDragging && "border-primary bg-accent/50",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            error ? "border-destructive" : "border-input"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload
              className={cn(
                "h-8 w-8",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted formats: {accept.replace(/\./g, "")}
              </p>
            </div>
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
