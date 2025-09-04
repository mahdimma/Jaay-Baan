import React from "react";
import { Button, Icon } from "../ui";
import {
  locationTypeLabels,
  locationTypeIcons,
  formatDate,
  getCleaningStatus,
} from "../../lib/utils";
import type { Location } from "../../types";

interface SimpleLocationCardProps {
  location: Location;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  onMove?: (location: Location) => void;
  onMarkCleaned?: (location: Location) => void;
  onSelect?: (location: Location) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

const SimpleLocationCard: React.FC<SimpleLocationCardProps> = ({
  location,
  onEdit,
  onDelete,
  onMove,
  onMarkCleaned,
  onSelect,
  isSelected = false,
  showActions = true,
}) => {
  const cleaningStatus = getCleaningStatus(
    location.cleaned_time,
    location.cleaned_duration
  );
  const locationTypeIcon =
    locationTypeIcons[location.location_type] || "more-horizontal";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
        isSelected
          ? "ring-2 ring-primary-500 border-primary-200"
          : "border-gray-200"
      }`}
      onClick={() => onSelect?.(location)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Icon
              name={locationTypeIcon as any}
              className="text-primary-600"
              size={20}
            />
            <div>
              <h3 className="font-medium text-gray-900">{location.name}</h3>
              <p className="text-sm text-gray-500">
                {locationTypeLabels[location.location_type]}
              </p>
            </div>
          </div>

          {location.is_container && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ظرف ({location.children_count})
            </span>
          )}
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {location.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-3">
          {location.barcode && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <Icon name="tag" size={14} className="text-gray-400" />
              <span className="text-gray-600">{location.barcode}</span>
            </div>
          )}

          {location.value && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <span className="text-gray-600">ارزش:</span>
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat("fa-IR").format(location.value)} تومان
              </span>
            </div>
          )}

          {location.quantity > 1 && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <span className="text-gray-600">تعداد:</span>
              <span className="font-medium text-gray-900">
                {location.quantity}
              </span>
            </div>
          )}
        </div>

        {/* Cleaning Status */}
        <div className="flex items-center space-x-2 space-x-reverse mb-3">
          <Icon
            name={
              cleaningStatus.status === "needs_cleaning"
                ? "alert-circle"
                : "check-circle"
            }
            size={14}
            className={
              cleaningStatus.status === "needs_cleaning"
                ? "text-orange-500"
                : "text-green-500"
            }
          />
          <span
            className={`text-xs ${
              cleaningStatus.status === "needs_cleaning"
                ? "text-orange-600"
                : "text-green-600"
            }`}
          >
            {cleaningStatus.message}
          </span>
        </div>

        {/* Images indicator */}
        {location.images.length > 0 && (
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <Icon name="image" size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">
              {location.images.length} تصویر
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1 space-x-reverse">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(location);
                  }}
                >
                  <Icon name="edit" size={14} />
                </Button>
              )}

              {onMove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(location);
                  }}
                >
                  <Icon name="move" size={14} />
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(location);
                  }}
                >
                  <Icon name="trash" size={14} className="text-red-500" />
                </Button>
              )}
            </div>

            {onMarkCleaned && cleaningStatus.status === "needs_cleaning" && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkCleaned(location);
                }}
              >
                <Icon name="check-circle" size={14} className="ml-1" />
                تمیز شد
              </Button>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          ایجاد شده: {formatDate(location.created_at)}
        </div>
      </div>
    </div>
  );
};

export default SimpleLocationCard;
