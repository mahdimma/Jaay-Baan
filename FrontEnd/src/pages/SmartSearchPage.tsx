import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLocationSearch, useLocationTree } from "../hooks/useApi";
import { useLocationStore } from "../store";
import {
  Button,
  Input,
  Select,
  Icon,
  Loading,
  TreeSelector,
} from "../components/ui";
import LocationCard from "../components/locations/LocationCard";
import BarcodeScanner from "../components/common/BarcodeScanner";
import { locationTypeLabels, debounce } from "../lib/utils";
import type { SearchParams, Location } from "../types";

const SmartSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedLocation, setCurrentParent } = useLocationStore();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    location_type: undefined,
    needs_cleaning: undefined,
    has_barcode: undefined,
    parent_id: undefined,
  });

  const [advancedMode, setAdvancedMode] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useLocationSearch(searchParams);
  const { data: treeData, isLoading: treeLoading } = useLocationTree();

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("jaay-baan-search-history");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search history
  useEffect(() => {
    if (searchParams.query && searchParams.query.length > 2) {
      setSearchHistory((prevHistory) => {
        const query = searchParams.query!; // We know it's defined from the if condition
        const newHistory = [
          query,
          ...prevHistory.filter((item) => item !== query),
        ].slice(0, 10);
        localStorage.setItem(
          "jaay-baan-search-history",
          JSON.stringify(newHistory)
        );
        return newHistory;
      });
    }
  }, [searchParams.query]);

  const debouncedSearch = useCallback(
    debounce((query: unknown) => {
      setSearchParams((prev) => ({ ...prev, query: query as string }));
    }, 300),
    []
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof SearchParams, value: any) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSearchParams({
      query: "",
      location_type: undefined,
      needs_cleaning: undefined,
      has_barcode: undefined,
      parent_id: undefined,
    });
  };

  const handleBarcodeScanned = (barcode: string) => {
    setSearchQuery(barcode);
    setSearchParams((prev) => ({ ...prev, query: barcode }));
    setIsScannerOpen(false);
    toast.success(`بارکد اسکن شد: ${barcode}`, {
      duration: 3000,
      icon: "📷",
    });
  };

  const handleLocationSelect = (location: Location) => {
    // Set the selected location in the store first
    setSelectedLocation(location);
    setCurrentParent(location.id);

    // Use setTimeout to ensure state updates are processed before navigation
    setTimeout(() => {
      navigate("/");
      toast.success(`انتقال به مکان: ${location.name}`, {
        duration: 2000,
        icon: "📍",
      });
    }, 50); // Small delay to ensure state is updated
  };

  const locationTypeOptions = [
    { value: "", label: "همه انواع" },
    ...Object.entries(locationTypeLabels).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const hasActiveFilters = Object.values(searchParams).some(
    (value) => value !== undefined && value !== "" && value !== null
  );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🔍 جستجوی هوشمند
                </h1>
                <p className="text-gray-600">
                  جستجو و فیلتر کردن مکان‌ها و اشیاء با امکانات پیشرفته
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant={advancedMode ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className="flex items-center gap-2"
                >
                  <Icon name="filter" size={16} />
                  {advancedMode ? "حالت ساده" : "حالت پیشرفته"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <Icon name="camera" size={16} />
                  اسکن بارکد
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Main Search */}
          <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="🔍 جستجو در نام، توضیحات یا بارکد..."
                onChange={handleQueryChange}
                value={searchQuery}
                className="pl-12 pr-4 h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-lg"
              />
              <Icon
                name="search"
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && !searchParams.query && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Icon name="clock" size={16} />
                جستجوهای اخیر
              </h4>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(term);
                      setSearchParams((prev) => ({ ...prev, query: term }));
                    }}
                    className="px-3 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all duration-200 hover:shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {advancedMode && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Icon name="settings" size={18} />
                فیلترهای پیشرفته
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Parent Selector */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      مکان والد
                    </label>
                    <TreeSelector
                      data={treeData}
                      isLoading={treeLoading}
                      selectedValue={searchParams.parent_id?.toString() || ""}
                      onSelect={(value) => {
                        if (value === "" || value === "root") {
                          handleFilterChange(
                            "parent_id",
                            value === "root" ? "root" : undefined
                          );
                        } else {
                          handleFilterChange("parent_id", parseInt(value));
                        }
                      }}
                      showRoot={true}
                      rootLabel="همه مکان‌ها"
                      filterContainers={true}
                      emptyMessage="مکانی برای انتخاب موجود نیست"
                    />
                  </div>
                </div>

                {/* Right Column - Location Type & Quick Filters */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      نوع مکان
                    </label>
                    <Select
                      value={searchParams.location_type || ""}
                      onChange={(e) =>
                        handleFilterChange("location_type", e.target.value)
                      }
                      options={locationTypeOptions}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      فیلترهای سریع
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors border border-blue-200">
                        <input
                          type="checkbox"
                          checked={searchParams.has_barcode === true}
                          onChange={(e) =>
                            handleFilterChange(
                              "has_barcode",
                              e.target.checked ? true : undefined
                            )
                          }
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-3"
                        />
                        <div>
                          <span className="text-sm font-medium text-blue-800">
                            📋 دارای بارکد
                          </span>
                          <p className="text-xs text-blue-600">
                            فقط مکان‌های دارای بارکد
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors border border-orange-200">
                        <input
                          type="checkbox"
                          checked={searchParams.needs_cleaning === true}
                          onChange={(e) =>
                            handleFilterChange(
                              "needs_cleaning",
                              e.target.checked ? true : undefined
                            )
                          }
                          className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 ml-3"
                        />
                        <div>
                          <span className="text-sm font-medium text-orange-800">
                            🧹 نیاز به تمیزکاری
                          </span>
                          <p className="text-xs text-orange-600">
                            فقط مکان‌های کثیف
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3 mb-3 sm:mb-0">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  <Icon name="x" size={16} />
                  پاک کردن فیلترها
                </Button>
              )}

              {searchResults && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  <Icon name="search" size={16} />
                  {searchResults.count} نتیجه یافت شد
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500">
              💡 برای جستجو حداقل 2 کاراکتر وارد کنید
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loading text="🔍 در حال جستجو..." />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="alert-circle" size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                خطا در جستجو
              </h3>
              <p className="text-gray-500">لطفاً دوباره تلاش کنید</p>
            </div>
          ) : searchResults?.results && searchResults.results.length > 0 ? (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Icon name="grid" size={20} />
                  نتایج جستجو
                </h2>

                <div className="flex items-center gap-4 mt-3 sm:mt-0">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                    {searchResults.count} مورد
                  </div>
                  {searchResults.count > searchResults.results.length && (
                    <span className="text-sm text-gray-500">
                      نمایش {searchResults.results.length} مورد از{" "}
                      {searchResults.count}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.results.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onSelect={handleLocationSelect}
                    showActions={false}
                  />
                ))}
              </div>
            </div>
          ) : hasActiveFilters ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="search" size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                نتیجه‌ای یافت نشد
              </h3>
              <p className="text-gray-500 mb-6">
                جستجوی شما نتیجه‌ای نداشت. سعی کنید فیلترها را تغییر دهید.
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                پاک کردن فیلترها
              </Button>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="search" size={32} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                جستجو کنید
              </h3>
              <p className="text-gray-500 mb-6">
                برای شروع، کلمه کلیدی وارد کنید یا از فیلترها استفاده کنید
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <Icon name="camera" size={16} className="ml-2" />
                  اسکن بارکد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                >
                  <Icon name="filter" size={16} className="ml-2" />
                  فیلترهای پیشرفته
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Barcode Scanner Modal */}
        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleBarcodeScanned}
          title="اسکن برای جستجو"
        />
      </div>
    </>
  );
};

export default SmartSearchPage;
