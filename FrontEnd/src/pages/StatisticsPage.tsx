import React, { useState } from "react";
import { useStatistics, useLocationsNeedingCleaning } from "../hooks/useApi";
import { Icon, Loading, Button } from "../components/ui";
import ExportDataModal from "../components/common/ExportDataModal";
import { locationTypeLabels, formatCurrency, formatDate } from "../lib/utils";
import type { LocationType } from "../types";

const StatisticsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<LocationType | "all">("all");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  const { data: stats, isLoading, error } = useStatistics();
  const { data: cleaningData, isLoading: cleaningLoading } =
    useLocationsNeedingCleaning();

  if (isLoading) {
    return <Loading text="بارگذاری آمار..." />;
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
          خطا در بارگذاری آمار
        </h3>
        <p className="text-gray-500">لطفاً دوباره تلاش کنید</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate estimated total value (simplified calculation)
  const totalValue = Object.entries(stats.by_type).reduce((acc, [, info]) => {
    return acc + info.count * 50000; // Estimated average value per item
  }, 0);

  const cleaningLocations = cleaningData?.results || [];

  // Get chart data for location types
  const chartData = Object.entries(stats.by_type)
    .filter(([type]) => selectedType === "all" || type === selectedType)
    .map(([type, info]) => ({
      type: type as LocationType,
      label: locationTypeLabels[type as LocationType],
      count: info.count,
      percentage: (info.count / stats.total_locations) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...chartData.map((item) => item.count));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">آمار سیستم</h1>
          <p className="mt-2 text-lg text-gray-500">
            نمای کلی و تحلیل داده‌های سیستم مدیریت مکان‌ها
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3 space-x-reverse">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode("overview")}
              className={`px-4 py-2 text-sm ${
                viewMode === "overview"
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              نمای کلی
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-4 py-2 text-sm border-r border-gray-300 ${
                viewMode === "detailed"
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              جزئیات
            </button>
          </div>

          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <Icon name="download" size={16} className="ml-2" />
            خروجی آمار
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">کل مکان‌ها</p>
              <p className="text-3xl font-bold">
                {stats.total_locations.toLocaleString()}
              </p>
              <p className="text-blue-100 text-xs mt-1">
                در {Object.keys(stats.by_type).length} دسته
              </p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <Icon name="layers" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                ظروف و نگهدارنده‌ها
              </p>
              <p className="text-3xl font-bold">
                {stats.containers.toLocaleString()}
              </p>
              <p className="text-green-100 text-xs mt-1">
                {((stats.containers / stats.total_locations) * 100).toFixed(1)}%
                از کل
              </p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <Icon name="package" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">آیتم‌ها</p>
              <p className="text-3xl font-bold">
                {stats.items.toLocaleString()}
              </p>
              <p className="text-purple-100 text-xs mt-1">
                {((stats.items / stats.total_locations) * 100).toFixed(1)}% از
                کل
              </p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <Icon name="tag" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                نیاز به تمیزکاری
              </p>
              <p className="text-3xl font-bold">
                {stats.locations_needing_cleaning.toLocaleString()}
              </p>
              <p className="text-orange-100 text-xs mt-1">
                {(
                  (stats.locations_needing_cleaning / stats.total_locations) *
                  100
                ).toFixed(1)}
                % از کل
              </p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <Icon name="alert-circle" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              تصاویر و مدارک
            </h3>
            <Icon name="image" className="text-blue-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                مکان‌های دارای تصویر:
              </span>
              <span className="font-medium">{stats.locations_with_images}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">درصد پوشش تصویر:</span>
              <span className="font-medium">
                {(
                  (stats.locations_with_images / stats.total_locations) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">بارکدها</h3>
            <Icon name="camera" className="text-green-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                مکان‌های دارای بارکد:
              </span>
              <span className="font-medium">
                {stats.locations_with_barcode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">درصد پوشش بارکد:</span>
              <span className="font-medium">
                {(
                  (stats.locations_with_barcode / stats.total_locations) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">ارزش تخمینی</h3>
            <Icon name="bar-chart" className="text-purple-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">کل ارزش تخمینی:</span>
              <span className="font-medium">{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">میانگین ارزش:</span>
              <span className="font-medium">
                {formatCurrency(totalValue / stats.total_locations)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              توزیع انواع مکان‌ها
            </h3>
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as LocationType | "all")
              }
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="all">همه انواع</option>
              {Object.entries(locationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-600">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cleaning Activity */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              مکان‌های نیازمند تمیزکاری
            </h3>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {cleaningLocations.length} مورد
            </span>
          </div>

          {cleaningLoading ? (
            <Loading text="بارگذاری..." />
          ) : cleaningLocations.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cleaningLocations.slice(0, 5).map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon
                      name={location.is_container ? "package" : "tag"}
                      size={16}
                      className="text-orange-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {location.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {location.breadcrumb}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-orange-600">
                    {location.cleaned_time
                      ? `آخرین تمیزکاری: ${formatDate(location.cleaned_time)}`
                      : "هرگز تمیز نشده"}
                  </div>
                </div>
              ))}

              {cleaningLocations.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500">
                    و {cleaningLocations.length - 5} مورد دیگر...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon
                name="check-circle"
                size={48}
                className="mx-auto text-green-400 mb-4"
              />
              <p className="text-gray-500">همه مکان‌ها تمیز هستند!</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed View */}
      {viewMode === "detailed" && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            جزئیات کامل انواع مکان‌ها
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع مکان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تعداد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    درصد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ارزش تخمینی
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats.by_type).map(([type, info]) => (
                  <tr key={type} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Icon
                          name={
                            type === "house"
                              ? "home"
                              : type === "room"
                              ? "door-open"
                              : "package"
                          }
                          size={16}
                          className="text-gray-400 ml-3"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {locationTypeLabels[type as LocationType]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {info.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((info.count / stats.total_locations) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(info.count * 50000)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportDataModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};

export default StatisticsPage;
