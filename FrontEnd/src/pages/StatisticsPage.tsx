import React, { useState, useMemo } from "react";
import { useStatistics, useLocationsNeedingCleaning } from "../hooks/useApi";
import { Icon, Button } from "../components/ui";
import ExportDataModal from "../components/common/ExportDataModal";
import {
  locationTypeLabels,
  formatCurrency,
  formatDate,
  locationTypeIcons,
} from "../lib/utils";
import type { LocationType } from "../types";

const StatisticsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<LocationType | "all">("all");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  const { data: stats, isLoading, error } = useStatistics();
  const { data: cleaningData, isLoading: cleaningLoading } =
    useLocationsNeedingCleaning();

  React.useEffect(() => {
    // Animation trigger
  }, []);

  const memoizedData = useMemo(() => {
    if (!stats) return null;

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
        icon: locationTypeIcons[type as LocationType] || "layers",
      }))
      .sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...chartData.map((item) => item.count));

    return { totalValue, cleaningLocations, chartData, maxCount };
  }, [stats, cleaningData, selectedType]);

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

  const { totalValue, cleaningLocations, chartData, maxCount } = memoizedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              {/* View Toggle */}
              <div className="bg-gray-100 rounded-2xl p-1 flex">
                <button
                  onClick={() => setViewMode("overview")}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    viewMode === "overview"
                      ? "bg-white text-blue-700 shadow-lg shadow-blue-500/25"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon name="grid" size={16} className="ml-2" />
                  نمای کلی
                </button>
                <button
                  onClick={() => setViewMode("detailed")}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    viewMode === "detailed"
                      ? "bg-white text-blue-700 shadow-lg shadow-blue-500/25"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon name="list" size={16} className="ml-2" />
                  جزئیات
                </button>
              </div>

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
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                تصاویر و مدارک
              </h3>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Icon name="image" className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <span className="text-gray-700 font-medium">
                  مکان‌های دارای تصویر
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.locations_with_images}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <span className="text-gray-700 font-medium">
                  درصد پوشش تصویر
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {(
                    (stats.locations_with_images / stats.total_locations) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">بارکدها</h3>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Icon name="camera" className="text-green-600" size={24} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <span className="text-gray-700 font-medium">
                  مکان‌های دارای بارکد
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.locations_with_barcode}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <span className="text-gray-700 font-medium">
                  درصد پوشش بارکد
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {(
                    (stats.locations_with_barcode / stats.total_locations) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">ارزش تخمینی</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Icon name="bar-chart" className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                <span className="text-gray-700 font-medium">
                  کل ارزش تخمینی
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                <span className="text-gray-700 font-medium">میانگین ارزش</span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalValue / stats.total_locations)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Distribution & Cleaning Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Modern Chart */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                توزیع انواع مکان‌ها
              </h3>
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as LocationType | "all")
                }
                className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              >
                <option value="all">همه انواع</option>
                {Object.entries(locationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              {chartData.map((item, index) => (
                <div key={item.type} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center ml-3 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                        <Icon
                          name={item.icon as any}
                          size={22}
                          className="text-white"
                        />
                      </div>
                      <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {item.count}
                      </span>
                      <span className="text-sm text-gray-500 block">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="relative h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg group-hover:shadow-xl"
                      style={{
                        width: `${(item.count / maxCount) * 100}%`,
                        animationDelay: `${index * 0.1}s`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Cleaning Activity */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                مکان‌های نیازمند تمیزکاری
              </h3>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                {cleaningLocations.length} مورد
              </div>
            </div>

            {cleaningLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
            ) : cleaningLocations.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {cleaningLocations.slice(0, 5).map((location, index) => (
                  <div
                    key={location.id}
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 p-6 hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <Icon
                            name={location.is_container ? "package" : "tag"}
                            size={20}
                            className="text-white"
                          />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {location.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {location.breadcrumb}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          {location.cleaned_time
                            ? `آخرین تمیزکاری: ${formatDate(
                                location.cleaned_time
                              )}`
                            : "هرگز تمیز نشده"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {cleaningLocations.length > 5 && (
                  <div className="text-center pt-4">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-full border border-orange-200">
                      <span className="text-sm font-medium text-orange-700">
                        و {cleaningLocations.length - 5} مورد دیگر...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon
                    name="check-circle"
                    size={40}
                    className="text-green-500"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">عالی!</h4>
                <p className="text-gray-600">همه مکان‌ها تمیز و مرتب هستند</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Detailed View */}
        {viewMode === "detailed" && (
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              جزئیات کامل انواع مکان‌ها
            </h3>

            <div className="overflow-x-auto rounded-2xl">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-8 py-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider rounded-tr-2xl">
                      نوع مکان
                    </th>
                    <th className="px-8 py-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      تعداد
                    </th>
                    <th className="px-8 py-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      درصد
                    </th>
                    <th className="px-8 py-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider"></th>
                    <th className="px-8 py-6 text-right text-sm font-bold text-gray-700 uppercase tracking-wider rounded-tl-2xl">
                      ارزش تخمینی
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(stats.by_type).map(([type, info]) => (
                    <tr
                      key={type}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center ml-2">
                            <Icon
                              name={locationTypeIcons[type] as any}
                              size={20}
                              className="text-white"
                            />
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {locationTypeLabels[type as LocationType]}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-xl font-bold text-gray-900">
                          {info.count.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <span className="text-lg font-bold text-gray-900">
                            {(
                              (info.count / stats.total_locations) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden mr-2">
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
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(info.count * 1)}
                        </span>
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
    </div>
  );
};

export default StatisticsPage;
