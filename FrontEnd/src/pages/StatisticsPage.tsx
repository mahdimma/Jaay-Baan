import React, { useState, useMemo } from "react";
import { useStatistics, useLocations } from "../hooks/useApi";
import { Icon, Button } from "../components/ui";
import ExportDataModal from "../components/common/ExportDataModal";
import {
  locationTypeLabels,
  formatCurrency,
  locationTypeIcons,
} from "../lib/utils";
import type { LocationType } from "../types";
import type { IconName } from "../types/icon";

const StatisticsPage: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, error } = useStatistics();
  // Fetch all locations to calculate actual values
  const { data: allLocations, isLoading: locationsLoading } = useLocations({
    page_size: 10000,
  }); // Large page size to get all locations

  const isLoading = statsLoading || locationsLoading;

  React.useEffect(() => {
    // Animation trigger
  }, []);

  const memoizedData = useMemo(() => {
    if (!stats || !allLocations) return { totalValue: 0, valuesByType: {} };

    // Calculate actual total value from all locations
    const totalValue = allLocations.results.reduce((sum, location) => {
      const locationValue = Number(location.value) || 0;
      return sum + locationValue;
    }, 0);

    // Calculate values by type
    const valuesByType: Record<string, number> = {};
    allLocations.results.forEach((location) => {
      const type = location.location_type;
      if (!valuesByType[type]) {
        valuesByType[type] = 0;
      }
      const locationValue = Number(location.value) || 0;
      valuesByType[type] += locationValue;
    });

    return { totalValue, valuesByType };
  }, [stats, allLocations]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 dark:border-r-purple-600 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            بارگذاری آمار...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            لطفاً صبر کنید
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100 dark:border-red-800">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              name="alert-circle"
              size={40}
              className="text-red-500 dark:text-red-400"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            خطا در بارگذاری آمار
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            متأسفانه در دریافت اطلاعات مشکلی پیش آمده است
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            <Icon name="refresh" size={16} className="ml-2" />
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  if (!stats || !memoizedData) {
    return null;
  }

  const { totalValue, valuesByType } = memoizedData;

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Modern Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center ml-4">
                  <Icon name="bar-chart" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    آمار سیستم
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                    نمای کلی و تحلیل هوشمند داده‌های سیستم
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0">
              {/* Export Button */}
              <Button
                variant="outline"
                onClick={() => setIsExportOpen(true)}
                className="hover:bg-blue-50 dark:hover:bg-slate-600 transition-all duration-300"
              >
                <Icon name="download" size={16} className="ml-2" />
                خروجی آمار
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Locations Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  کل مکان‌ها
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.total_locations.toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  در {Object.keys(stats.by_type).length} دسته‌بندی
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Icon
                  name="layers"
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-full"></div>
            </div>
          </div>

          {/* Containers Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  نگهدارنده‌ها
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.containers.toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {((stats.containers / stats.total_locations) * 100).toFixed(
                    1
                  )}
                  % از کل
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Icon
                  name="package"
                  size={20}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(stats.containers / stats.total_locations) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  آیتم‌ها
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.items.toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {((stats.items / stats.total_locations) * 100).toFixed(1)}% از
                  کل
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Icon
                  name="tag"
                  size={20}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${(stats.items / stats.total_locations) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Cleaning Needed Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  نیاز به تمیزکاری
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.locations_needing_cleaning.toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {(
                    (stats.locations_needing_cleaning / stats.total_locations) *
                    100
                  ).toFixed(1)}
                  % از کل
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Icon
                  name="alert-circle"
                  size={20}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{
                  width: `${
                    (stats.locations_needing_cleaning / stats.total_locations) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Enhanced Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                تصاویر و مدارک
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Icon name="image" className="text-white" size={20} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  مکان‌های دارای تصویر
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.locations_with_images}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  درصد پوشش تصویر
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(
                    (stats.locations_with_images / stats.total_locations) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                بارکدها
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Icon name="camera" className="text-white" size={20} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  مکان‌های دارای بارکد
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.locations_with_barcode}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  درصد پوشش بارکد
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(
                    (stats.locations_with_barcode / stats.total_locations) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                ارزش تخمینی
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Icon name="bar-chart" className="text-white" size={20} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  کل ارزش تخمینی
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(Number(totalValue) || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  میانگین ارزش
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(
                    stats.total_locations > 0
                      ? (Number(totalValue) || 0) / stats.total_locations
                      : 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* جزئیات کامل مکان‌ها */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            جزئیات کامل مکان‌ها
          </h3>

          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700">
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider rounded-tr-xl">
                    نوع مکان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    تعداد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    درصد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"></th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">
                    ارزش تخمینی
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {Object.entries(stats.by_type)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([type, info]) => (
                    <tr
                      key={type}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ml-2">
                            <Icon
                              name={locationTypeIcons[type] as IconName}
                              size={16}
                              className="text-white"
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {locationTypeLabels[type as LocationType]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {info.count.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {(
                              (info.count / stats.total_locations) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden mr-2">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                              style={{
                                width: `${
                                  (info.count / stats.total_locations) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(Number(valuesByType[type]) || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Modal */}
        <ExportDataModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      </div>
    </div>
  );
};

export default StatisticsPage;
