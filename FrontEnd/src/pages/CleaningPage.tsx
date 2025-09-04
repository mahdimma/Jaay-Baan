import React from "react";
import {
  useLocationsNeedingCleaning,
  useMarkCleaned,
  useBulkOperations,
} from "../hooks/useApi";
import { useLocationStore } from "../store";
import { Button, Icon, Loading } from "../components/ui";
import SimpleLocationCard from "../components/locations/SimpleLocationCard";
import type { Location } from "../types";

const CleaningPage: React.FC = () => {
  const {
    selectedItems,
    setSelectedItems,
    toggleSelectedItem,
    clearSelection,
  } = useLocationStore();

  const {
    data: cleaningData,
    isLoading,
    error,
  } = useLocationsNeedingCleaning();
  const markCleanedMutation = useMarkCleaned();
  const bulkOperationMutation = useBulkOperations();

  const handleMarkCleaned = (location: Location) => {
    markCleanedMutation.mutate(location.id);
  };

  const handleBulkMarkCleaned = () => {
    if (selectedItems.length === 0) return;

    bulkOperationMutation.mutate(
      {
        operation: "mark_cleaned",
        location_ids: selectedItems,
      },
      {
        onSuccess: () => {
          clearSelection();
        },
      }
    );
  };

  const handleSelectAll = () => {
    if (!cleaningData?.results) return;

    const allIds = cleaningData.results.map((location) => location.id);
    setSelectedItems(allIds);
  };

  const handleSelectNone = () => {
    clearSelection();
  };

  const isAllSelected =
    cleaningData?.results &&
    selectedItems.length === cleaningData.results.length;

  if (isLoading) {
    return <Loading text="بارگذاری مکان‌های نیازمند تمیزکاری..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon
          name="alert-circle"
          size={48}
          className="mx-auto text-red-400 mb-4"
        />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          خطا در بارگذاری
        </h3>
        <p className="text-gray-500">لطفاً دوباره تلاش کنید</p>
      </div>
    );
  }

  const locations = cleaningData?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت تمیزکاری</h1>
          <p className="mt-1 text-sm text-gray-500">
            مکان‌هایی که نیاز به تمیزکاری دارند ({locations.length} مورد)
          </p>
        </div>

        {locations.length > 0 && (
          <div className="mt-4 sm:mt-0 flex items-center space-x-3 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={isAllSelected ? handleSelectNone : handleSelectAll}
            >
              {isAllSelected ? "لغو انتخاب همه" : "انتخاب همه"}
            </Button>

            {selectedItems.length > 0 && (
              <Button
                onClick={handleBulkMarkCleaned}
                loading={bulkOperationMutation.isPending}
              >
                <Icon name="check-circle" size={16} className="ml-1" />
                تمیز کردن {selectedItems.length} مورد
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Selection Info */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Icon name="check-circle" className="text-blue-600" size={20} />
              <span className="text-blue-800 font-medium">
                {selectedItems.length} مورد انتخاب شده
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-blue-600 hover:text-blue-800"
            >
              لغو انتخاب
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {locations.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Icon
            name="check-circle"
            size={64}
            className="mx-auto text-green-400 mb-4"
          />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            عالی! همه چیز تمیز است
          </h3>
          <p className="text-gray-500 mb-6">هیچ مکانی نیاز به تمیزکاری ندارد</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
            <p className="text-green-800 text-sm">
              💡 نکته: می‌توانید از صفحه آمار وضعیت کلی سیستم را مشاهده کنید
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`relative transition-all ${
                  selectedItems.includes(location.id)
                    ? "ring-2 ring-primary-500 ring-offset-2"
                    : ""
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(location.id)}
                    onChange={() => toggleSelectedItem(location.id)}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                </div>

                <SimpleLocationCard
                  location={location}
                  onMarkCleaned={handleMarkCleaned}
                  isSelected={selectedItems.includes(location.id)}
                  showActions={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Icon
            name="alert-circle"
            className="text-yellow-600 flex-shrink-0"
            size={20}
          />
          <div>
            <h4 className="text-yellow-800 font-medium mb-1">نکات مفید:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>
                • مکان‌ها براساس آخرین زمان تمیزکاری و دوره تمیزکاری تعریف شده
                نمایش داده می‌شوند
              </li>
              <li>
                • می‌توانید چندین مکان را به طور همزمان به عنوان تمیز
                علامت‌گذاری کنید
              </li>
              <li>
                • دوره تمیزکاری هر مکان را می‌توانید در بخش ویرایش تنظیم کنید
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningPage;
