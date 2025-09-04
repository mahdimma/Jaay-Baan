import React, { useState, useCallback } from "react";
import Icon from "./Icon";
import Button from "./Button";
import { cn } from "../../lib/utils";

interface ImageUploadProps {
  onUpload: (files: FileList) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = "image/*",
  className,
  multiple = true,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const validateFiles = (files: FileList): boolean => {
    setError("");

    if (files.length > maxFiles) {
      setError(`حداکثر ${maxFiles} فایل می‌توانید انتخاب کنید`);
      return false;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeMB = file.size / (1024 * 1024);

      if (sizeMB > maxSizeMB) {
        setError(`حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد`);
        return false;
      }

      if (!file.type.startsWith("image/")) {
        setError("فقط فایل‌های تصویری مجاز هستند");
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (validateFiles(files)) {
      onUpload(files);
    }
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [disabled]
  );

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver && !disabled
            ? "border-primary-400 bg-primary-50"
            : "border-gray-300",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <Icon name="image" size={48} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              تصاویر را اینجا بکشید یا کلیک کنید
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG، JPG، GIF تا {maxSizeMB} مگابایت
              {multiple && ` (حداکثر ${maxFiles} فایل)`}
            </p>
          </div>

          <Button type="button" variant="outline" size="sm" disabled={disabled}>
            <Icon name="upload" size={16} className="ml-2" />
            انتخاب فایل
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <Icon name="alert-circle" size={16} className="ml-1" />
          {error}
        </p>
      )}
    </div>
  );
};
