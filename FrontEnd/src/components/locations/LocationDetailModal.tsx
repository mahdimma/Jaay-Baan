import React, { useState } from "react";
import { Button, Icon, Modal, ImageGallery } from "../ui";
import {
  locationTypeLabels,
  locationTypeIcons,
  formatDate,
  formatCurrency,
  cn,
} from "../../lib/utils";
import type { Location } from "../../types";
import type { IconName } from "../../types/icon";
import toast from "react-hot-toast";

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  onMove?: (location: Location) => void;
  onMarkCleaned?: (location: Location) => void;
  onViewChildren?: (location: Location) => void;
}

const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  isOpen,
  onClose,
  location,
  onEdit,
  onDelete,
  onMove,
  onMarkCleaned,
  onViewChildren,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);

  if (!location) return null;

  const locationTypeIcon =
    locationTypeIcons[location.location_type] || "more-horizontal";

  // Calculate cleaning status
  const getCleaningStatus = () => {
    if (!location.cleaned_time) return "never";
    const lastCleaned = new Date(location.cleaned_time);
    const now = new Date();
    const daysSince = Math.floor(
      (now.getTime() - lastCleaned.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince > location.cleaned_duration) return "overdue";
    if (daysSince > location.cleaned_duration * 0.8) return "due-soon";
    return "clean";
  };

  const cleaningStatus = getCleaningStatus();

  // Get status colors
  const getStatusColor = () => {
    switch (cleaningStatus) {
      case "overdue":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800";
      case "due-soon":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
      case "clean":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const primaryImage =
    location.images?.find((img) => img.is_primary) || location.images?.[0];

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} کپی شد: ${text}`);
      })
      .catch(() => {
        toast.error("خطا در کپی کردن");
      });
  };

  const handleDelete = () => {
    if (location.children_count > 0) {
      toast.error(
        `این مکان دارای ${location.children_count} فرزند است. ابتدا آنها را حذف یا جابجا کنید.`
      );
      return;
    }
    onDelete?.(location);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="جزئیات مکان"
        size="xl"
        className="xl:max-w-4xl"
      >
        <div className="space-y-5 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            {/* Icon and Main Info */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Icon
                  name={locationTypeIcon as IconName}
                  className="text-primary-600 dark:text-slate-400"
                  size={24}
                />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {location.name}
                </h2>
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  {locationTypeLabels[location.location_type]}
                </span>
              </div>
            </div>
            {/* Status Badges - Moved above ID/Barcode for better flow */}
            <div className="flex flex-wrap gap-2">
              {location.needs_cleaning && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                  <Icon name="alert-circle" size={12} className="ml-1" />
                  نیاز به تمیزکاری
                </span>
              )}

              {location.is_container && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  <Icon name="package" size={12} className="ml-1" />
                  ظرف ({location.children_count})
                </span>
              )}
            </div>

            {/* Clickable ID and Barcode */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  handleCopyToClipboard(location.id.toString(), "شناسه")
                }
                className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
              >
                <Icon name="hash" size={12} />
                <span className="font-mono text-xs">#{location.id}</span>
                <Icon name="file-text" size={10} className="opacity-70" />
              </button>

              {location.barcode && (
                <button
                  onClick={() =>
                    handleCopyToClipboard(location.barcode!, "بارکد")
                  }
                  className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                >
                  <Icon name="tag" size={12} />
                  <span className="font-mono text-xs truncate max-w-[120px]">
                    {location.barcode}
                  </span>
                  <Icon name="file-text" size={10} className="opacity-70" />
                </button>
              )}
            </div>

            {/* Breadcrumb */}
            {location.breadcrumb && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Icon name="map-pin" size={12} />
                <span className="truncate">{location.breadcrumb}</span>
              </div>
            )}
          </div>

          {/* Primary Image - Mobile Optimized */}
          {primaryImage && (
            <div className="relative">
              <img
                src={primaryImage.image}
                alt={location.name}
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              {location.images && location.images.length > 1 && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  <Icon name="camera" size={12} className="inline ml-1" />
                  {location.images.length} تصویر
                </div>
              )}
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white transition-colors shadow-sm"
              >
                <Icon name="eye" size={12} className="inline ml-1" />
                مشاهده همه
              </button>
            </div>
          )}

          {/* Description - Mobile Optimized */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              توضیحات
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              {location.description ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {location.description}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                  توضیحاتی ارائه نشده است
                </p>
              )}
            </div>
          </div>
          {/* Details Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              مشخصات
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Value */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Icon
                    name="star"
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    ارزش کل
                  </span>
                </div>
                {location.value ? (
                  <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                    {formatCurrency(location.value)}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    نامشخص
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Icon
                    name="list"
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    تعداد
                  </span>
                </div>
                <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                  {new Intl.NumberFormat("fa-IR").format(location.quantity)}
                </span>
              </div>
            </div>
          </div>

          {/* Cleaning Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              وضعیت تمیزکاری
            </h3>
            {location.cleaned_time ? (
              <div
                className={cn(
                  "rounded-lg p-3 sm:p-4 border transition-colors",
                  getStatusColor()
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon
                      name={
                        cleaningStatus === "clean"
                          ? "check-circle"
                          : cleaningStatus === "due-soon"
                          ? "clock"
                          : "alert-circle"
                      }
                      size={16}
                    />
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        آخرین تمیزکاری: {formatDate(location.cleaned_time)}
                      </p>
                      <p className="text-xs sm:text-sm opacity-80">
                        فاصله تمیزکاری: هر {location.cleaned_duration} روز
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-sm sm:text-base">
                    {cleaningStatus === "clean" && "تمیز"}
                    {cleaningStatus === "due-soon" && "نزدیک موعد"}
                    {cleaningStatus === "overdue" && "گذشته از موعد"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  برنامه تمیزکاری تعریف نشده است
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              تاریخچه
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse text-xs sm:text-sm">
                <Icon name="calendar" size={12} className="text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  تاریخ ایجاد: {formatDate(location.created_at)}
                </span>
              </div>
              {location.updated_at !== location.created_at && (
                <div className="flex items-center space-x-2 space-x-reverse text-xs sm:text-sm">
                  <Icon name="refresh" size={12} className="text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    آخرین بروزرسانی: {formatDate(location.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {location.is_container && location.children_count > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onViewChildren?.(location);
                    onClose();
                  }}
                  className="text-xs sm:text-sm"
                  icon={
                    <Icon
                      name="arrow-left"
                      size={14}
                      className="ml-1 sm:ml-2"
                    />
                  }
                  text={`مشاهده فرزندان (${location.children_count})`}
                />
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onEdit?.(location);
                  onClose();
                }}
                icon={<Icon name="edit" size={14} className="ml-1 sm:ml-2" />}
                text="ویرایش"
                className="text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20"
              />

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onMove?.(location);
                  onClose();
                }}
                icon={<Icon name="move" size={14} className="ml-1 sm:ml-2" />}
                text="انتقال"
                className="text-xs sm:text-sm hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900/20"
              />

              {location.needs_cleaning && onMarkCleaned && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onMarkCleaned(location);
                    onClose();
                  }}
                  icon={
                    <Icon
                      name="check-circle"
                      size={14}
                      className="ml-1 sm:ml-2"
                    />
                  }
                  text="تمیز شد"
                  className="text-xs sm:text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20"
                />
              )}
            </div>

            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              className="w-full sm:w-auto hover:bg-red-600 hover:border-red-600 text-xs sm:text-sm"
              icon={<Icon name="trash" size={14} className="ml-1 sm:ml-2" />}
              text="حذف"
            />
          </div>
        </div>
      </Modal>

      {/* Image Gallery Modal */}
      {location.images && location.images.length > 0 && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title={`تصاویر ${location.name}`}
          size="lg"
          className="max-w-full sm:max-w-2xl lg:max-w-4xl mx-4 sm:mx-auto"
        >
          <ImageGallery images={location.images} />
        </Modal>
      )}
    </>
  );
};

export default LocationDetailModal;
