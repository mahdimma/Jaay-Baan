import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { locationsApi } from "../../services/api";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOptions {
  format: "json" | "csv";
  includeImages: boolean;
  includeStatistics: boolean;
  filterByType?: string[];
  filterByParent?: number;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: "json",
    includeImages: false,
    includeStatistics: true,
  });

  const exportMutation = useMutation({
    mutationFn: () => locationsApi.exportData(),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `jaay-baan-export-${timestamp}.${options.format}`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("فایل با موفقیت دانلود شد");
      onClose();
    },
    onError: () => {
      toast.error("خطا در دانلود فایل");
    },
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  const locationTypes = [
    { value: "house", label: "خانه" },
    { value: "room", label: "اتاق" },
    { value: "storage", label: "انبار" },
    { value: "shelf", label: "قفسه" },
    { value: "container", label: "ظرف" },
    { value: "box", label: "جعبه" },
    { value: "item", label: "آیتم" },
    { value: "other", label: "سایر" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="خروجی گیری از داده‌ها"
      size="md"
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            فرمت فایل
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                setOptions((prev) => ({ ...prev, format: "json" }))
              }
              className={cn(
                "p-4 border rounded-lg text-center transition-colors dark:text-gray-300",
                options.format === "json"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-gray-300"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              )}
            >
              <Icon name="file-text" size={24} className="mx-auto mb-2" />
              <div className="font-medium">JSON</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                فرمت کامل با تمام جزئیات
              </div>
            </button>

            <button
              onClick={() => setOptions((prev) => ({ ...prev, format: "csv" }))}
              className={cn(
                "p-4 border rounded-lg text-center transition-colors dark:text-gray-300",
                options.format === "csv"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-gray-300"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              )}
            >
              <Icon name="bar-chart" size={24} className="mx-auto mb-2" />
              <div className="font-medium">CSV</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                فرمت جدولی برای اکسل
              </div>
            </button>
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            گزینه‌های اضافی
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeImages}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    includeImages: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
              />
              <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                شامل اطلاعات تصاویر
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeStatistics}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    includeStatistics: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
              />
              <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                شامل آمار کلی
              </span>
            </label>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            فیلتر براساس نوع (اختیاری)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {locationTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.filterByType?.includes(type.value) || false}
                  onChange={(e) => {
                    const currentTypes = options.filterByType || [];
                    if (e.target.checked) {
                      setOptions((prev) => ({
                        ...prev,
                        filterByType: [...currentTypes, type.value],
                      }));
                    } else {
                      setOptions((prev) => ({
                        ...prev,
                        filterByType: currentTypes.filter(
                          (t) => t !== type.value
                        ),
                      }));
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <Icon
              name="alert-circle"
              className="text-blue-600 dark:text-blue-400 mt-0.5 ml-3"
              size={16}
            />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">نکات مهم:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  فایل‌های تصویری در خروجی JSON به صورت لینک گنجانده می‌شوند
                </li>
                <li>فرمت CSV شامل فیلدهای اصلی است</li>
                <li>داده‌های صادر شده شامل تاریخ و زمان ایجاد است</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            className="ml-2"
            variant="outline"
            onClick={onClose}
            disabled={exportMutation.isPending}
          >
            انصراف
          </Button>
          <Button
            onClick={handleExport}
            loading={exportMutation.isPending}
            className="flex items-center"
          >
            <Icon name="download" size={16} className="ml-2" />
            دانلود فایل
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportDataModal;
