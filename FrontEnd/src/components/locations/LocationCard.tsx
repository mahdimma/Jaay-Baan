import React, { useState } from "react";
import { Button, Icon, Modal, ImageGallery } from "../ui";
import Checkbox from "../ui/Checkbox";
import {
  locationTypeLabels,
  locationTypeIcons,
  formatDate,
} from "../../lib/utils";
import type { Location } from "../../types";

interface LocationCardProps {
  location: Location;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  onMove?: (location: Location) => void;
  onMarkCleaned?: (location: Location) => void;
  onSelect?: (location: Location) => void;
  onToggleSelect?: (id: number) => void;
  isSelected?: boolean;
  showActions?: boolean;
  showSelection?: boolean;
  compact?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onEdit,
  onDelete,
  onMove,
  onMarkCleaned,
  onSelect,
  onToggleSelect,
  isSelected = false,
  showActions = true,
  showSelection = false,
  compact = false,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const locationTypeIcon =
    locationTypeIcons[location.location_type] || "more-horizontal";

  const handleCardClick = () => {
    if (!showSelection) {
      onSelect?.(location);
    }
  };

  const handleCheckboxChange = () => {
    onToggleSelect?.(location.id);
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

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all hover:shadow-md ${
          isSelected
            ? "ring-2 ring-primary-500 border-primary-200 dark:border-primary-600"
            : "border-gray-200 dark:border-gray-700"
        } ${!showSelection ? "cursor-pointer" : ""}`}
        onClick={handleCardClick}
      >
        {/* Image */}
        {primaryImage && !compact && (
          <div className="aspect-video w-full">
            <img
              src={primaryImage.image}
              alt={location.name}
              className="w-full h-full object-cover rounded-t-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowImageModal(true);
              }}
            />
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-2 space-x-reverse">
              {showSelection && (
                <div className="mt-1">
                  <Checkbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2 space-x-reverse">
                <Icon
                  name={locationTypeIcon as any}
                  className="text-primary-600 dark:text-gray-400"
                  size={20}
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {locationTypeLabels[location.location_type]}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              {location.needs_cleaning && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                  <Icon name="alert-circle" size={12} className="ml-1" />
                  نیاز به تمیزکاری
                </span>
              )}

              {location.is_container && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  ظرف ({location.children_count})
                </span>
              )}

              {location.images && location.images.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  <Icon name="camera" size={12} className="ml-1" />
                  {location.images.length}
                </span>
              )}
            </div>
          </div>

          {/* Breadcrumb */}
          {location.breadcrumb && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
              {location.breadcrumb}
            </div>
          )}

          {/* Description */}
          {location.description && !compact && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {location.description}
            </p>
          )}

          {/* Details */}
          <div className="space-y-2 mb-3">
            {location.barcode && (
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <Icon
                  name="tag"
                  size={14}
                  className="text-gray-400 dark:text-gray-500"
                />
                <span className="text-gray-600 dark:text-gray-300 font-mono">
                  {location.barcode}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              {location.value && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    ارزش:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white mr-1">
                    {new Intl.NumberFormat("fa-IR").format(location.value)} ت
                  </span>
                </div>
              )}

              {location.quantity > 1 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    تعداد:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white mr-1">
                    {location.quantity}
                  </span>
                </div>
              )}

              {location.cleaned_time && (
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    آخرین تمیزکاری:
                  </span>
                  <span className="mr-1 text-gray-900 dark:text-white">
                    {formatDate(location.cleaned_time)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(location);
                  }}
                >
                  <Icon name="edit" size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove?.(location);
                  }}
                >
                  <Icon name="move" size={14} />
                </Button>

                {location.needs_cleaning && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkCleaned?.(location);
                    }}
                  >
                    <Icon name="check-circle" size={14} />
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Icon name="trash" size={14} />
              </Button>
            </div>
          )}
        </div>
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
