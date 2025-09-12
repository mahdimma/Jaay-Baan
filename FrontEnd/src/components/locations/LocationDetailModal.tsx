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
      <Modal isOpen={isOpen} onClose={onClose} title="جزئیات مکان" size="xl">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4 space-x-reverse">
            {/* Icon */}
            <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon
                name={locationTypeIcon as IconName}
                className="text-primary-600 dark:text-primary-400"
                size={32}
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 space-x-reverse mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {location.name}
                </h2>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {locationTypeLabels[location.location_type]}
                </span>
              </div>

              {/* Clickable ID and Barcode */}
              <div className="flex items-center space-x-4 space-x-reverse mb-3">
                <button
                  onClick={() =>
                    handleCopyToClipboard(location.id.toString(), "شناسه")
                  }
                  className="flex items-center space-x-1 space-x-reverse text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                >
                  <Icon name="hash" size={14} />
                  <span className="font-mono">#{location.id}</span>
                  <Icon name="file-text" size={12} className="opacity-50" />
                </button>

                {location.barcode && (
                  <button
                    onClick={() =>
                      handleCopyToClipboard(location.barcode!, "بارکد")
                    }
                    className="flex items-center space-x-1 space-x-reverse text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  >
                    <Icon name="tag" size={14} />
                    <span className="font-mono">{location.barcode}</span>
                    <Icon name="file-text" size={12} className="opacity-50" />
                  </button>
                )}
              </div>

              {/* Breadcrumb */}
              {location.breadcrumb && (
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                  <Icon name="map-pin" size={14} />
                  <span>{location.breadcrumb}</span>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-col items-end space-y-2 flex-shrink-0">
              {location.needs_cleaning && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                  <Icon name="alert-circle" size={14} className="ml-1" />
                  نیاز به تمیزکاری
                </span>
              )}

              {location.is_container && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  <Icon name="package" size={14} className="ml-1" />
                  ظرف ({location.children_count})
                </span>
              )}
            </div>
          </div>

          {/* Primary Image */}
          {primaryImage && (
            <div className="relative">
              <img
                src={primaryImage.image}
                alt={location.name}
                className="w-full h-64 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              {location.images && location.images.length > 1 && (
                <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                  <Icon name="camera" size={14} className="inline ml-1" />
                  {location.images.length} تصویر
                </div>
              )}
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                <Icon name="eye" size={14} className="inline ml-1" />
                مشاهده همه
              </button>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              توضیحات
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              {location.description ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {location.description}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Value */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Icon
                    name="star"
                    size={18}
                    className="text-green-600 dark:text-green-400"
                  />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ارزش کل
                  </span>
                </div>
                {location.value ? (
                  <span className="font-bold text-xl text-gray-900 dark:text-white">
                    {formatCurrency(location.value)}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    نامشخص
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Icon
                    name="list"
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    تعداد
                  </span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
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
                  "rounded-lg p-4 border transition-colors",
                  getStatusColor()
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon
                      name={
                        cleaningStatus === "clean"
                          ? "check-circle"
                          : cleaningStatus === "due-soon"
                          ? "clock"
                          : "alert-circle"
                      }
                      size={20}
                    />
                    <div>
                      <p className="font-medium">
                        آخرین تمیزکاری: {formatDate(location.cleaned_time)}
                      </p>
                      <p className="text-sm opacity-80">
                        فاصله تمیزکاری: هر {location.cleaned_duration} روز
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">
                    {cleaningStatus === "clean" && "تمیز"}
                    {cleaningStatus === "due-soon" && "نزدیک موعد"}
                    {cleaningStatus === "overdue" && "گذشته از موعد"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-500 dark:text-gray-400">
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
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <Icon name="calendar" size={14} className="text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  تاریخ ایجاد: {formatDate(location.created_at)}
                </span>
              </div>
              {location.updated_at !== location.created_at && (
                <div className="flex items-center space-x-2 space-x-reverse text-sm">
                  <Icon name="refresh" size={14} className="text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    آخرین بروزرسانی: {formatDate(location.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse">
              {location.is_container && location.children_count > 0 && (
                <Button
                  onClick={() => {
                    onViewChildren?.(location);
                    onClose();
                  }}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  icon={<Icon name="arrow-left" size={16} className="ml-2" />}
                  text={`مشاهده فرزندان (${location.children_count})`}
                />
              )}

              <Button
                variant="outline"
                onClick={() => {
                  onEdit?.(location);
                  onClose();
                }}
                icon={<Icon name="edit" size={16} className="ml-2" />}
                text="ویرایش"
                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20"
              />

              <Button
                variant="outline"
                onClick={() => {
                  onMove?.(location);
                  onClose();
                }}
                icon={<Icon name="move" size={16} className="ml-2" />}
                text="انتقال"
                className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900/20"
              />

              {location.needs_cleaning && onMarkCleaned && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onMarkCleaned(location);
                    onClose();
                  }}
                  icon={<Icon name="check-circle" size={16} className="ml-2" />}
                  text="تمیز شد"
                  className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20"
                />
              )}
            </div>

            <Button
              variant="danger"
              onClick={handleDelete}
              className="hover:bg-red-600 hover:border-red-600"
              icon={<Icon name="trash" size={16} className="ml-2" />}
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
        >
          <ImageGallery images={location.images} />
        </Modal>
      )}
    </>
  );
};

export default LocationDetailModal;
