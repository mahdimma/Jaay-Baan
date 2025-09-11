import React from "react";
import {
  useLocationsNeedingCleaning,
  useMarkCleaned,
  useBulkOperations,
} from "../hooks/useApi";
import { useLocationStore } from "../store";
import { Button, Icon, Loading } from "../components/ui";
import LocationCard from "../components/locations/LocationCard";
import type { Location } from "../types";

const CleaningPage: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <Loading text="بارگذاری مکان‌های نیازمند تمیزکاری..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border dark:border-slate-700">
            <Icon
              name="alert-circle"
              size={64}
              className="mx-auto text-red-400 dark:text-red-500 mb-6"
            />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              خطا در بارگذاری
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              متاسفانه در بارگذاری اطلاعات مشکلی پیش آمده است
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gray-600 dark:bg-gray-400 hover:bg-gray-700 dark:hover:bg-gray-300"
              text="تلاش مجدد"
            />
          </div>
        </div>
      </div>
    );
  }

  const locations = cleaningData?.results || [];

  return (
    <div className="space-y-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Modern Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Icon name="check-circle" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                    مدیریت تمیزکاری
                  </h1>
                  <div className="flex items-center space-x-2 space-x-reverse mt-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      مکان‌های نیازمند تمیزکاری
                    </span>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700 mr-1">
                      {locations.length} مورد
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {locations.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                {/* View Toggle */}
                <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon name="grid" size={16} className="ml-2" />
                    شبکه‌ای
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon name="list" size={16} className="ml-2" />
                    لیستی
                  </button>
                </div>

                {/* Select All/None */}
                <Button
                  variant="outline"
                  onClick={isAllSelected ? handleSelectNone : handleSelectAll}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  icon={
                    <Icon
                      name={isAllSelected ? "x" : "check-circle"}
                      size={16}
                      className="ml-2"
                    />
                  }
                  text={isAllSelected ? "لغو انتخاب همه" : "انتخاب همه"}
                />

                {/* Bulk Action */}
                {selectedItems.length > 0 && (
                  <Button
                    onClick={handleBulkMarkCleaned}
                    loading={bulkOperationMutation.isPending}
                    className="bg-gray-600 dark:bg-gray-400 hover:bg-gray-700 dark:hover:bg-gray-300"
                    icon={
                      <Icon name="check-circle" size={16} className="ml-2" />
                    }
                    text={`تمیز کردن ${selectedItems.length} مورد`}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selection Info Banner */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <Icon
                    name="check-circle"
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                </div>
                <div>
                  <span className="text-blue-900 dark:text-blue-200 font-semibold text-lg">
                    {selectedItems.length} مورد انتخاب شده
                  </span>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                    آماده برای عملیات دسته‌جمعی
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={clearSelection}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100/50 dark:hover:bg-blue-800/30"
                icon={<Icon name="x" size={16} className="ml-1" />}
                text="لغو انتخاب"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        {locations.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-full inline-block">
                  <Icon
                    name="check-circle"
                    size={48}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                🎉 عالی! همه چیز تمیز است
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                هیچ مکانی نیاز به تمیزکاری ندارد
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-3 space-x-reverse">
                  <span className="text-2xl">💡</span>
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    می‌توانید از صفحه آمار وضعیت کلی سیستم را مشاهده کنید
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Locations Grid/List */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`group relative transition-all duration-300 ${
                    selectedItems.includes(location.id)
                      ? "ring-2 ring-blue-500 ring-offset-4 ring-offset-transparent scale-105"
                      : "hover:scale-102"
                  }`}
                >
                  {/* Enhanced Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-20">
                    <label className="relative cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(location.id)}
                        onChange={() => toggleSelectedItem(location.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                          selectedItems.includes(location.id)
                            ? "bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600 shadow-lg"
                            : "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                      >
                        {selectedItems.includes(location.id) && (
                          <Icon
                            name="check-circle"
                            size={14}
                            className="text-white"
                          />
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Overlay for selected state */}
                  {selectedItems.includes(location.id) && (
                    <div className="absolute inset-0 bg-blue-500/10 rounded-2xl pointer-events-none z-10"></div>
                  )}

                  <LocationCard
                    location={location}
                    onMarkCleaned={handleMarkCleaned}
                    isSelected={selectedItems.includes(location.id)}
                    showActions={false}
                    variant="minimal"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg flex-shrink-0">
              <Icon
                name="alert-circle"
                className="text-amber-600 dark:text-amber-400"
                size={20}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-amber-900 dark:text-amber-300 font-semibold mb-3 text-lg">
                💡 نکات مفید
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <span className="text-amber-600 dark:text-amber-400 mt-1">
                      •
                    </span>
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      مکان‌ها براساس آخرین زمان تمیزکاری و دوره تعریف شده نمایش
                      داده می‌شوند
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <span className="text-amber-600 dark:text-amber-400 mt-1">
                      •
                    </span>
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      می‌توانید چندین مکان را همزمان به عنوان تمیز علامت‌گذاری
                      کنید
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <span className="text-amber-600 dark:text-amber-400 mt-1">
                      •
                    </span>
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      دوره تمیزکاری هر مکان را در بخش ویرایش تنظیم کنید
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <span className="text-amber-600 dark:text-amber-400 mt-1">
                      •
                    </span>
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      از نمای شبکه‌ای یا لیستی برای مشاهده بهتر استفاده کنید
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningPage;
