import React from "react";
import type { Location } from "../../types";
import { Icon, Button } from "../ui";
import {
  locationTypeLabels,
  locationTypeIcons,
  formatDate,
  formatCurrency,
  getCleaningStatus,
  cn,
} from "../../lib/utils";

interface LocationCardProps {
  location: Location;
  onSelect?: (location: Location) => void;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  onMove?: (location: Location) => void;
  onMarkCleaned?: (location: Location) => void;
  selected?: boolean;
  showActions?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onSelect,
  onEdit,
  onDelete,
  onMove,
  onMarkCleaned,
  selected = false,
  showActions = true,
}) => {
  const cleaningStatus = getCleaningStatus(
    location.cleaned_time,
    location.cleaned_duration
  );

  const handleCardClick = () => {
    onSelect?.(location);
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer",
        selected
          ? "border-primary-500 bg-primary-50"
          : "border-gray-200 hover:border-gray-300"
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div
              className={cn(
                "p-2 rounded-md",
                location.is_container
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              <Icon
                name={
                  (locationTypeIcons[location.location_type] as any) || "tag"
                }
                size={20}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{location.name}</h3>
              <p className="text-sm text-gray-500">
                {locationTypeLabels[location.location_type]}
                {location.is_container && (
                  <span className="mr-2 text-blue-600">
                    ({location.children_count} فرزند)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick status indicators */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {location.barcode && (
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                بارکد
              </div>
            )}
            {location.images.length > 0 && (
              <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {location.images.length} تصویر
              </div>
            )}
            {cleaningStatus.status === "needs_cleaning" && (
              <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                نیاز به تمیزکاری
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {location.description && (
          <p className="text-gray-600 text-sm mb-3">{location.description}</p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {location.quantity > 1 && (
            <div>
              <span className="text-gray-500">تعداد:</span>
              <span className="mr-1 font-medium">{location.quantity}</span>
            </div>
          )}

          {location.value && (
            <div>
              <span className="text-gray-500">ارزش:</span>
              <span className="mr-1 font-medium">
                {formatCurrency(location.value)}
              </span>
            </div>
          )}

          {location.barcode && (
            <div>
              <span className="text-gray-500">بارکد:</span>
              <span className="mr-1 font-mono text-xs">{location.barcode}</span>
            </div>
          )}

          <div>
            <span className="text-gray-500">آخرین بروزرسانی:</span>
            <span className="mr-1 text-xs">
              {formatDate(location.updated_at)}
            </span>
          </div>
        </div>

        {/* Cleaning status */}
        {location.cleaned_time && (
          <div className="mt-3 p-2 rounded-md bg-gray-50">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Icon
                name={
                  cleaningStatus.status === "clean"
                    ? "check-circle"
                    : "alert-circle"
                }
                size={16}
                className={
                  cleaningStatus.status === "clean"
                    ? "text-green-600"
                    : "text-red-600"
                }
              />
              <span className="text-sm text-gray-700">
                {cleaningStatus.message}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="trash" size={14} />
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
        </div>
      )}
    </div>
  );
};

export default LocationCard;
