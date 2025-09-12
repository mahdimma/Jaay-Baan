import React, { useState } from "react";
import { Button, Icon, Modal, ImageGallery } from "../ui";
import Checkbox from "../ui/Checkbox";
import LocationDetailModal from "./LocationDetailModal";
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

interface LocationCardProps {
  location: Location;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  onMove?: (location: Location) => void;
  onMarkCleaned?: (location: Location) => void;
  onViewChildren?: (location: Location) => void;
  onToggleSelect?: (id: number) => void;
  isSelected?: boolean;
  showActions?: boolean;
  showSelection?: boolean;
  compact?: boolean;
  variant?: "default" | "minimal" | "detailed";
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onEdit,
  onDelete,
  onMove,
  onMarkCleaned,
  onViewChildren,
  onToggleSelect,
  isSelected = false,
  showActions = true,
  showSelection = false,
  compact = false,
  variant = "default",
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const locationTypeIcon =
    locationTypeIcons[location.location_type] || "more-horizontal";

  const handleCardClick = () => {
    if (!showSelection) {
      setShowDetailModal(true);
    }
  };

  const handleCheckboxChange = () => {
    onToggleSelect?.(location.id);
  };

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
      setShowDeleteModal(true);
    } else {
      onDelete?.(location);
    }
  };

  const primaryImage =
    location.images?.find((img) => img.is_primary) || location.images?.[0];

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

  const cardVariants = {
    default: "shadow-sm hover:shadow-lg",
    minimal: "shadow-sm hover:shadow-md border-l-4",
    detailed: "shadow-md hover:shadow-xl",
  };

  // Render modals for both variants
  const renderModals = () => (
    <>
      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title={`تصاویر ${location.name}`}
        size="lg"
      >
        <ImageGallery images={location.images || []} />
      </Modal>

      {/* Location Detail Modal */}
      <LocationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        location={location}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
        onMarkCleaned={onMarkCleaned}
        onViewChildren={onViewChildren}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="خطا در حذف"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Icon
              name="alert-circle"
              className="text-orange-600 mt-1"
              size={20}
            />
            <div>
              <p className="text-gray-900">
                این مکان دارای {location.children_count} فرزند است.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                برای حذف این مکان، ابتدا تمام مکان‌های درون آن را حذف یا جابجا
                کنید.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              متوجه شدم
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );

  // Minimal card render - Fixed Layout
  if (variant === "minimal") {
    return (
      <>
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg border-l-4 border-l-primary-500 border-r border-t border-b border-gray-200 dark:border-gray-700 transition-all duration-300 group cursor-pointer relative overflow-hidden",
            "h-[280px] w-full flex flex-col", // Fixed height and layout
            isSelected
              ? "ring-2 ring-primary-500 shadow-lg"
              : "hover:shadow-md hover:border-primary-300"
          )}
          onClick={handleCardClick}
        >
          <div className="p-3 h-full flex flex-col">
            {/* Fixed Header - 60px */}
            <div className="h-[30px] flex items-start justify-between mb-3 flex-shrink-0">
              <div className="flex items-start space-x-2 space-x-reverse flex-1 min-w-0">
                {showSelection && (
                  <Checkbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    className="mt-0.5 flex-shrink-0"
                  />
                )}
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name={locationTypeIcon as IconName}
                    className="text-primary-600 dark:text-primary-400"
                    size={16}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
                    {location.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {locationTypeLabels[location.location_type]}
                  </p>
                </div>
              </div>

              {/* Fixed status indicators */}
              <div className="flex flex-col items-end space-y-1 flex-shrink-0 w-[40px]">
                {location.needs_cleaning && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
                {location.is_container && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                    {location.children_count}
                  </span>
                )}
              </div>
            </div>

            {/* Fixed Barcode Section - 20px */}
            <div className="h-[20px] flex-shrink-0 mb-2">
              {location.barcode ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyToClipboard(location.barcode!, "بارکد");
                  }}
                  className="flex items-center space-x-1 space-x-reverse text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xs transition-colors cursor-pointer"
                >
                  <Icon name="tag" size={10} />
                  <span className="font-mono truncate">{location.barcode}</span>
                  <Icon name="file-text" size={8} className="opacity-50" />
                </button>
              ) : (
                <div></div>
              )}
            </div>

            {/* Fixed Breadcrumb Section - 20px */}
            <div className="h-[20px] flex-shrink-0 mb-3">
              {location.breadcrumb ? (
                <div className="flex items-center space-x-1 space-x-reverse text-gray-500 dark:text-gray-400 text-xs">
                  <Icon name="map-pin" size={10} />
                  <span className="truncate">{location.breadcrumb}</span>
                </div>
              ) : (
                <div></div>
              )}
            </div>

            {/* Fixed Value/Quantity Grid - 60px */}
            <div className="h-[60px] flex-shrink-0 mb-3">
              <div className="grid grid-cols-2 gap-2 h-full">
                {/* Value Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 flex flex-col justify-center">
                  {location.value ? (
                    <>
                      <div className="flex items-center space-x-1 space-x-reverse mb-1">
                        <Icon
                          name="star"
                          size={10}
                          className="text-green-600"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ارزش
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {formatCurrency(location.value)}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xs text-gray-400">ارزش نامشخص</span>
                    </div>
                  )}
                </div>

                {/* Quantity Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 flex flex-col justify-center">
                  <div className="flex items-center space-x-1 space-x-reverse mb-1">
                    <Icon name="list" size={10} className="text-blue-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      تعداد
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("fa-IR").format(location.quantity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed Cleaning Status - 35px */}
            <div className="h-[25px] flex-shrink-0 mb-1">
              {location.cleaned_time ? (
                <div
                  className={cn(
                    "p-2 rounded h-full flex items-center",
                    getStatusColor()
                  )}
                >
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Icon
                      name={
                        cleaningStatus === "clean"
                          ? "check-circle"
                          : cleaningStatus === "due-soon"
                          ? "clock"
                          : "alert-circle"
                      }
                      size={10}
                    />
                    <span className="text-xs font-medium">
                      {cleaningStatus === "clean" && "تمیز"}
                      {cleaningStatus === "due-soon" && "نزدیک موعد"}
                      {cleaningStatus === "overdue" && "گذشته از موعد"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded h-full flex items-center">
                  <span className="text-xs text-gray-400">
                    بدون برنامه تمیزکاری
                  </span>
                </div>
              )}
            </div>

            {/* Fixed Actions Footer - Auto height */}
            <div className="flex-1 flex flex-col justify-end">
              {showActions && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1 space-x-reverse">
                      {location.is_container && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewChildren?.(location);
                          }}
                          className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20"
                          icon={<Icon name="chevron-left" size={12} />}
                        />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(location);
                        }}
                        icon={<Icon name="edit" size={12} />}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove?.(location);
                        }}
                        className="ml-1"
                        icon={<Icon name="move" size={12} />}
                      />
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        icon={<Icon name="trash" size={12} />}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyToClipboard(location.id.toString(), "شناسه");
                      }}
                      className="text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-mono transition-colors cursor-pointer"
                    >
                      #{location.id}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderModals()}
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg border transition-all duration-300 group",
          cardVariants[variant],
          isSelected
            ? "ring-2 ring-primary-500 border-primary-200 dark:border-primary-600 shadow-lg transform scale-[1.02]"
            : "border-gray-200 dark:border-gray-700",
          !showSelection && "cursor-pointer",
          "relative overflow-hidden"
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Enhanced Image Section */}
        {primaryImage && !compact && (
          <div className="relative aspect-video w-full group/image">
            <img
              src={primaryImage.image}
              alt={location.name}
              className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                setShowImageModal(true);
              }}
            />
            {/* Image overlay with quick actions */}
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 rounded-t-lg flex items-center justify-center opacity-0 group-hover/image:opacity-100">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageModal(true);
                }}
                icon={<Icon name="eye" size={16} />}
                text="مشاهده"
              />
            </div>
            {/* Image count indicator */}
            {location.images && location.images.length > 1 && (
              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                <Icon name="camera" size={12} className="inline ml-1" />
                {location.images.length}
              </div>
            )}
            {/* Cleaning status indicator */}
            {location.needs_cleaning && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
            )}
          </div>
        )}

        <div className={cn("p-4", compact && "p-3")}>
          {/* Fixed Header Section - 80px */}
          <div className="h-[80px] flex items-start justify-between mb-4 flex-shrink-0">
            <div className="flex items-start space-x-3 space-x-reverse flex-1">
              {showSelection && (
                <div className="mt-1.5">
                  <Checkbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                  />
                </div>
              )}

              <div className="flex items-start space-x-3 space-x-reverse flex-1 min-w-0">
                {/* Icon with background */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Icon
                      name={locationTypeIcon as IconName}
                      className="text-primary-600 dark:text-primary-400"
                      size={20}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate">
                      {location.name}
                    </h3>
                    {location.barcode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyToClipboard(location.barcode!, "بارکد");
                        }}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex-shrink-0 hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-300 transition-colors cursor-pointer"
                      >
                        <Icon name="tag" size={10} className="ml-1" />
                        {location.barcode}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {locationTypeLabels[location.location_type]}
                  </p>

                  {/* Fixed Breadcrumb */}
                  <div className="h-[16px] flex items-center">
                    {location.breadcrumb ? (
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate font-medium">
                        <Icon
                          name="map-pin"
                          size={10}
                          className="inline ml-1"
                        />
                        {location.breadcrumb}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Status Badges Section - 80px width */}
            <div className="w-[80px] flex flex-col items-end space-y-1 flex-shrink-0">
              {location.needs_cleaning && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                  <Icon name="alert-circle" size={12} className="ml-1" />
                  نیاز به تمیزکاری
                </span>
              )}

              {location.is_container && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  <Icon name="package" size={12} className="ml-1" />
                  ظرف ({location.children_count})
                </span>
              )}

              {!primaryImage &&
                location.images &&
                location.images.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                    <Icon name="camera" size={12} className="ml-1" />
                    {location.images.length} تصویر
                  </span>
                )}
            </div>
          </div>

          {/* Fixed Description Section - 60px */}
          <div className="h-[60px] mb-4 flex-shrink-0">
            {location.description && !compact ? (
              <div className="h-full">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {location.description}
                </p>
              </div>
            ) : (
              <div className="h-full flex items-center">
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                  توضیحات ندارد
                </span>
              </div>
            )}
          </div>

          {/* Fixed Details Grid Section - 120px */}
          <div className="h-[120px] mb-4 flex-shrink-0">
            <div className="h-full flex flex-col space-y-3">
              {/* Value and Quantity Grid - 80px */}
              <div className="h-[80px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
                  {/* Value */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600 flex flex-col justify-center">
                    {location.value ? (
                      <>
                        <div className="flex items-center space-x-2 space-x-reverse mb-1">
                          <Icon
                            name="star"
                            size={14}
                            className="text-green-600 dark:text-green-400"
                          />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            ارزش کل
                          </span>
                        </div>
                        <span className="font-bold text-lg text-gray-900 dark:text-white truncate">
                          {formatCurrency(location.value)}
                        </span>
                      </>
                    ) : (
                      <div className="text-center">
                        <Icon
                          name="star"
                          size={20}
                          className="text-gray-400 mx-auto mb-1"
                        />
                        <span className="text-xs text-gray-400">
                          ارزش نامشخص
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600 flex flex-col justify-center">
                    <div className="flex items-center space-x-2 space-x-reverse mb-1">
                      <Icon
                        name="list"
                        size={14}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        تعداد
                      </span>
                    </div>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {new Intl.NumberFormat("fa-IR").format(location.quantity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cleaning Information - 35px */}
              <div className="h-[35px]">
                {location.cleaned_time ? (
                  <div
                    className={cn(
                      "rounded-lg p-3 border transition-colors h-full flex items-center justify-between",
                      getStatusColor()
                    )}
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Icon
                        name={
                          cleaningStatus === "clean"
                            ? "check-circle"
                            : cleaningStatus === "due-soon"
                            ? "clock"
                            : "alert-circle"
                        }
                        size={14}
                      />
                      <span className="text-xs font-medium">
                        آخرین تمیزکاری:{" "}
                        {formatDate(location.cleaned_time).split(" ")[0]}
                      </span>
                    </div>
                    <span className="text-xs font-medium">
                      {cleaningStatus === "clean" && "تمیز"}
                      {cleaningStatus === "due-soon" && "نزدیک موعد"}
                      {cleaningStatus === "overdue" && "گذشته از موعد"}
                    </span>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 h-full flex items-center justify-center">
                    <span className="text-xs text-gray-400">
                      بدون برنامه تمیزکاری
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Actions */}
          {showActions && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 -mx-4 px-4 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                {/* Primary Actions */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  {location.is_container && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewChildren?.(location);
                      }}
                      className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20 transition-colors"
                      icon={<Icon name="chevron-left" size={14} />}
                      text="مشاهده فرزندان"
                    />
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(location);
                    }}
                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 transition-colors"
                    icon={<Icon name="edit" size={14} />}
                    text="ویرایش"
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove?.(location);
                    }}
                    className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900/20 transition-colors"
                    icon={<Icon name="move" size={14} />}
                    text="انتقال"
                  />

                  {location.needs_cleaning && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkCleaned?.(location);
                      }}
                      className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20 transition-colors"
                      icon={<Icon name="check-circle" size={14} />}
                      text="تمیز شد"
                    />
                  )}
                </div>

                {/* Delete Action */}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="hover:bg-red-600 hover:border-red-600 transition-colors"
                  icon={<Icon name="trash" size={14} />}
                  text="حذف"
                />
              </div>

              {/* Quick Stats Row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="flex items-center space-x-1 space-x-reverse">
                    <Icon name="calendar" size={12} />
                    <span>
                      ایجاد: {formatDate(location.created_at).split(" ")[0]}
                    </span>
                  </span>
                  {location.updated_at !== location.created_at && (
                    <span className="flex items-center space-x-1 space-x-reverse">
                      <Icon name="refresh" size={12} />
                      <span>
                        بروزرسانی:{" "}
                        {formatDate(location.updated_at).split(" ")[0]}
                      </span>
                    </span>
                  )}
                </div>

                {/* Location ID for reference */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyToClipboard(location.id.toString(), "شناسه");
                  }}
                  className="font-mono text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                >
                  #{location.id}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hover indicator */}
        <div
          className={cn(
            "absolute top-0 left-0 w-1 h-full bg-primary-500 transition-all duration-300 rounded-r",
            isHovered && !isSelected ? "opacity-100" : "opacity-0"
          )}
        ></div>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title={`تصاویر ${location.name}`}
        size="lg"
      >
        <ImageGallery images={location.images || []} />
      </Modal>

      {/* Location Detail Modal */}
      <LocationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        location={location}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
        onMarkCleaned={onMarkCleaned}
        onViewChildren={onViewChildren}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="خطا در حذف"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Icon
              name="alert-circle"
              className="text-orange-600 mt-1"
              size={20}
            />
            <div>
              <p className="text-gray-900">
                این مکان دارای {location.children_count} فرزند است.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                برای حذف این مکان، ابتدا تمام مکان‌های درون آن را حذف یا جابجا
                کنید.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              متوجه شدم
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LocationCard;
