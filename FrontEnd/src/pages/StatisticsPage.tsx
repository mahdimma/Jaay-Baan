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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-lg font-medium text-gray-700">بارگذاری آمار...</p>
          <p className="text-sm text-gray-500 mt-1">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="alert-circle" size={40} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            خطا در بارگذاری آمار
          </h3>
          <p className="text-gray-600 mb-6">
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
    <div className="min-h-screen">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative space-y-8 p-6 lg:p-8">
        {/* Modern Header */}
        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center ml-4">
                  <Icon name="bar-chart" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    آمار سیستم
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
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
                className="bg-white/80 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl mr-2"
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
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-blue-100 text-sm font-medium mb-2">
                    کل مکان‌ها
                  </p>
                  <p className="text-4xl font-bold text-white mb-1 animate-pulse">
                    {stats.total_locations.toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-xs">
                    در {Object.keys(stats.by_type).length} دسته‌بندی
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  <Icon name="layers" size={28} className="text-white" />
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 rounded-full w-full transform translate-x-0 transition-transform duration-1000 shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Containers Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-green-100 text-sm font-medium mb-2">
                    نگهدارنده‌ها
                  </p>
                  <p className="text-4xl font-bold text-white mb-1 animate-pulse">
                    {stats.containers.toLocaleString()}
                  </p>
                  <p className="text-green-200 text-xs">
                    {((stats.containers / stats.total_locations) * 100).toFixed(
                      1
                    )}
                    % از کل
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  <Icon name="package" size={28} className="text-white" />
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/40 rounded-full transition-all duration-1000 shadow-sm"
                  style={{
                    width: `${
                      (stats.containers / stats.total_locations) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-purple-100 text-sm font-medium mb-2">
                    آیتم‌ها
                  </p>
                  <p className="text-4xl font-bold text-white mb-1 animate-pulse">
                    {stats.items.toLocaleString()}
                  </p>
                  <p className="text-purple-200 text-xs">
                    {((stats.items / stats.total_locations) * 100).toFixed(1)}%
                    از کل
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  <Icon name="tag" size={28} className="text-white" />
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/40 rounded-full transition-all duration-1000 shadow-sm"
                  style={{
                    width: `${(stats.items / stats.total_locations) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Cleaning Needed Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-orange-100 text-sm font-medium mb-2">
                    نیاز به تمیزکاری
                  </p>
                  <p className="text-4xl font-bold text-white mb-1 animate-pulse">
                    {stats.locations_needing_cleaning.toLocaleString()}
                  </p>
                  <p className="text-orange-200 text-xs">
                    {(
                      (stats.locations_needing_cleaning /
                        stats.total_locations) *
                      100
                    ).toFixed(1)}
                    % از کل
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  <Icon name="alert-circle" size={28} className="text-white" />
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/40 rounded-full transition-all duration-1000 shadow-sm"
                  style={{
                    width: `${
                      (stats.locations_needing_cleaning /
                        stats.total_locations) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="group backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                تصاویر و مدارک
              </h3>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Icon name="image" className="text-white" size={26} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
                <span className="text-gray-700 font-medium">
                  مکان‌های دارای تصویر
                </span>
                <span className="text-3xl font-bold text-blue-600 animate-pulse">
                  {stats.locations_with_images}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
                <span className="text-gray-700 font-medium">
                  درصد پوشش تصویر
                </span>
                <span className="text-3xl font-bold text-blue-600 animate-pulse">
                  {(
                    (stats.locations_with_images / stats.total_locations) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                بارکدها
              </h3>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Icon name="camera" className="text-white" size={26} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-shadow duration-300">
                <span className="text-gray-700 font-medium">
                  مکان‌های دارای بارکد
                </span>
                <span className="text-3xl font-bold text-green-600 animate-pulse">
                  {stats.locations_with_barcode}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-shadow duration-300">
                <span className="text-gray-700 font-medium">
                  درصد پوشش بارکد
                </span>
                <span className="text-3xl font-bold text-green-600 animate-pulse">
                  {(
                    (stats.locations_with_barcode / stats.total_locations) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                ارزش تخمینی
              </h3>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Icon name="bar-chart" className="text-white" size={26} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow duration-300">
                <span className="text-gray-700 font-medium">
                  کل ارزش تخمینی
                </span>
                <span className="text-3xl font-bold text-purple-600 animate-pulse">
                  {formatCurrency(Number(totalValue) || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow duration-300">
                <span className="text-gray-700 font-medium">میانگین ارزش</span>
                <span className="text-3xl font-bold text-purple-600 animate-pulse">
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
        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            جزئیات کامل مکان‌ها
          </h3>

          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider rounded-tr-xl">
                    نوع مکان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    تعداد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    درصد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider"></th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider rounded-tl-xl">
                    ارزش تخمینی
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(stats.by_type)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([type, info]) => (
                    <tr
                      key={type}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ml-2">
                            <Icon
                              name={locationTypeIcons[type] as any}
                              size={16}
                              className="text-white"
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {locationTypeLabels[type as LocationType]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {info.count.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-sm font-bold text-gray-900">
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
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
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
                        <span className="text-sm font-bold text-gray-900">
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
