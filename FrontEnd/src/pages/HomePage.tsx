import React, { useState, useCallback } from "react";
import {
  useLocationTree,
  useLocations,
  useCreateLocation,
  useDeleteLocation,
  useMarkCleaned,
  useMoveLocation,
  useBreadcrumb,
  useUpdateLocation,
} from "../hooks/useApi";
import { useLocationStore } from "../store";
import { Button, Icon, Loading } from "../components/ui";
import TreeView from "../components/locations/TreeView";
import LocationCard from "../components/locations/LocationCard";
import LocationForm from "../components/locations/LocationForm";
import BulkActions from "../components/locations/BulkActions";
import Breadcrumb from "../components/common/Breadcrumb";
import ExportDataModal from "../components/common/ExportDataModal";
import MoveLocationModal from "../components/common/MoveLocationModal";
import toast from "react-hot-toast";
import type { Location, TreeNode, CreateLocationData } from "../types";

const HomePage: React.FC = () => {
  // UI State
  const [uiState, setUiState] = useState({
    isFormOpen: false,
    isExportOpen: false,
    isMoveModalOpen: false,
    view: "grid" as "tree" | "grid",
    bulkMode: false,
  });

  // Data State
  const [dataState, setDataState] = useState({
    locationToMove: null as Location | null,
    selectedParentId: undefined as number | undefined,
    editingLocation: null as Location | null,
  });

  // Store State
  const {
    selectedLocation,
    currentParent,
    selectedItems,
    setSelectedLocation,
    setCurrentParent,
    toggleSelectedItem,
    clearSelection,
  } = useLocationStore();

  // API Queries
  const { data: treeData, isLoading: treeLoading } = useLocationTree();
  const { data: locationsData, isLoading: locationsLoading } = useLocations({
    parent_id: currentParent || "root",
    page_size: 50,
  });
  const { data: breadcrumbData } = useBreadcrumb(selectedLocation?.id || 0);

  // API Mutations
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();
  const deleteLocationMutation = useDeleteLocation();
  const markCleanedMutation = useMarkCleaned();
  const moveLocationMutation = useMoveLocation();

  // Helper functions to update state
  const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
    setUiState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateDataState = useCallback((updates: Partial<typeof dataState>) => {
    setDataState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Event Handlers
  const handleNodeSelect = useCallback(
    (node: TreeNode) => {
      setSelectedLocation(node);
      setCurrentParent(node.id);
      // Don't disable bulk mode when selecting tree nodes
      // Users should be able to navigate while in bulk mode
    },
    [setSelectedLocation, setCurrentParent]
  );

  const handleHomeClick = useCallback(() => {
    setSelectedLocation(null);
    setCurrentParent(null);
    // Don't disable bulk mode when navigating home
    // Users should be able to navigate while in bulk mode
  }, [setSelectedLocation, setCurrentParent]);

  const handleCreateLocation = useCallback(
    (data: CreateLocationData) => {
      const parentId =
        dataState.selectedParentId ||
        selectedLocation?.id ||
        currentParent ||
        undefined;
      const locationData = { ...data, parent_id: parentId };

      createLocationMutation.mutate(locationData, {
        onSuccess: () => {
          updateUiState({ isFormOpen: false });
          updateDataState({ selectedParentId: undefined });
          toast.success("مکان جدید با موفقیت ایجاد شد");
        },
      });
    },
    [
      dataState.selectedParentId,
      selectedLocation,
      currentParent,
      createLocationMutation,
      updateUiState,
      updateDataState,
    ]
  );

  const handleUpdateLocation = useCallback(
    (data: CreateLocationData) => {
      if (!dataState.editingLocation) return;

      updateLocationMutation.mutate(
        { id: dataState.editingLocation.id, ...data },
        {
          onSuccess: () => {
            updateUiState({ isFormOpen: false });
            updateDataState({ editingLocation: null });
            toast.success("مکان با موفقیت بروزرسانی شد");
          },
        }
      );
    },
    [
      dataState.editingLocation,
      updateLocationMutation,
      updateUiState,
      updateDataState,
    ]
  );

  const handleDeleteLocation = useCallback(
    (location: Location) => {
      if (window.confirm(`آیا از حذف "${location.name}" اطمینان دارید؟`)) {
        deleteLocationMutation.mutate(location.id, {
          onSuccess: () => {
            toast.success("مکان با موفقیت حذف شد");
          },
        });
      }
    },
    [deleteLocationMutation]
  );

  const handleMarkCleaned = useCallback(
    (location: Location) => {
      markCleanedMutation.mutate(location.id, {
        onSuccess: () => {
          toast.success("مکان به عنوان تمیز علامت‌گذاری شد");
        },
      });
    },
    [markCleanedMutation]
  );

  const handleMoveLocation = useCallback(
    (location: Location) => {
      updateDataState({ locationToMove: location });
      updateUiState({ isMoveModalOpen: true });
    },
    [updateDataState, updateUiState]
  );

  const handleConfirmMove = useCallback(
    (newParentId: number | null) => {
      if (!dataState.locationToMove) return;

      moveLocationMutation.mutate(
        { id: dataState.locationToMove.id, new_parent_id: newParentId },
        {
          onSuccess: () => {
            updateUiState({ isMoveModalOpen: false });
            updateDataState({ locationToMove: null });
            toast.success("مکان با موفقیت جابجا شد");
          },
        }
      );
    },
    [
      dataState.locationToMove,
      moveLocationMutation,
      updateUiState,
      updateDataState,
    ]
  );

  const handleToggleBulkMode = useCallback(() => {
    const newBulkMode = !uiState.bulkMode;
    updateUiState({ bulkMode: newBulkMode });
    if (newBulkMode === false) clearSelection();
  }, [uiState.bulkMode, updateUiState, clearSelection]);

  const handleOpenCreateForm = useCallback(() => {
    updateDataState({
      selectedParentId: selectedLocation?.id || currentParent || undefined,
      editingLocation: null,
    });
    updateUiState({ isFormOpen: true });
  }, [selectedLocation, currentParent, updateDataState, updateUiState]);

  const handleEditLocation = useCallback(
    (location: Location) => {
      updateDataState({ editingLocation: location });
      updateUiState({ isFormOpen: true });
    },
    [updateDataState, updateUiState]
  );

  const handleSelectLocation = useCallback(
    (location: Location) => {
      // Navigate into the selected location to show its children
      setSelectedLocation(location);
      setCurrentParent(location.id);
    },
    [setSelectedLocation, setCurrentParent]
  );

  const locations = locationsData?.results || [];

  // Empty state component to avoid duplication
  const renderEmptyState = useCallback(
    () => (
      <div className="text-center py-16">
        <Icon
          name="package"
          size={64}
          className="mx-auto text-gray-300 dark:text-gray-600 mb-6"
        />
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          مکانی موجود نیست
        </h3>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
          شروع کنید با ایجاد اولین مکان
        </p>
        <Button
          onClick={handleOpenCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
        >
          <Icon name="plus" size={20} className="ml-2" />
          ایجاد مکان
        </Button>
      </div>
    ),
    [handleOpenCreateForm]
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              مدیریت مکان‌ها
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              مدیریت و سازماندهی اشیاء فیزیکی شما
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Bulk Mode Toggle */}
            <Button
              variant={uiState.bulkMode ? "secondary" : "outline"}
              size="sm"
              onClick={handleToggleBulkMode}
              className="flex items-center gap-2"
            >
              <Icon name="list" size={16} />
              انتخاب گروهی
            </Button>

            {/* View Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => updateUiState({ view: "tree" })}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  uiState.view === "tree"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon name="list" size={14} className="mr-1" />
                درخت
              </button>
              <button
                onClick={() => updateUiState({ view: "grid" })}
                className={`px-4 py-2 text-sm font-medium border-r border-gray-300 dark:border-gray-600 transition-colors ${
                  uiState.view === "grid"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon name="grid" size={14} className="mr-1" />
                شبکه
              </button>
            </div>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateUiState({ isExportOpen: true })}
              className="flex items-center gap-2"
            >
              <Icon name="download" size={16} />
              خروجی
            </Button>
            <Button
              onClick={handleOpenCreateForm}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon name="plus" size={16} />
              مکان جدید
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {selectedLocation && breadcrumbData && (
        <div className="mb-6">
          <Breadcrumb
            items={breadcrumbData}
            onItemClick={(item) => setCurrentParent(item.id)}
            onHomeClick={handleHomeClick}
          />
        </div>
      )}

      {/* Bulk Actions */}
      {uiState.bulkMode && selectedItems.length > 0 && (
        <div className="mb-6">
          <BulkActions
            selectedItems={selectedItems}
            onClearSelection={() => {
              updateUiState({ bulkMode: false });
              clearSelection();
            }}
            allItems={locations}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Tree Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              درخت مکان‌ها
            </h2>
            {treeLoading ? (
              <Loading text="بارگذاری..." />
            ) : (
              <TreeView
                data={treeData || []}
                onNodeSelect={handleNodeSelect}
                selectedNodeId={selectedLocation?.id}
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3">
          {locationsLoading ? (
            <Loading text="بارگذاری مکان‌ها..." />
          ) : locations.length === 0 ? (
            renderEmptyState()
          ) : uiState.view === "tree" ? (
            /* Tree View */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
                  {selectedLocation ? selectedLocation.name : "همه مکان‌ها"}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {locations.length} مورد
                </span>
              </div>
              <div className="space-y-3">
                {locations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onViewChildren={handleSelectLocation}
                    onEdit={() => handleEditLocation(location)}
                    onDelete={() => handleDeleteLocation(location)}
                    onMarkCleaned={() => handleMarkCleaned(location)}
                    onMove={() => handleMoveLocation(location)}
                    showSelection={uiState.bulkMode}
                    isSelected={selectedItems.includes(location.id)}
                    onToggleSelect={toggleSelectedItem}
                    variant="detailed"
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onViewChildren={handleSelectLocation}
                  onEdit={() => handleEditLocation(location)}
                  onDelete={() => handleDeleteLocation(location)}
                  onMarkCleaned={() => handleMarkCleaned(location)}
                  onMove={() => handleMoveLocation(location)}
                  showSelection={uiState.bulkMode}
                  isSelected={selectedItems.includes(location.id)}
                  onToggleSelect={toggleSelectedItem}
                  variant="minimal"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LocationForm
        isOpen={uiState.isFormOpen}
        onClose={() => {
          updateUiState({ isFormOpen: false });
          updateDataState({
            selectedParentId: undefined,
            editingLocation: null,
          });
        }}
        onSubmit={
          dataState.editingLocation
            ? handleUpdateLocation
            : handleCreateLocation
        }
        parentId={dataState.selectedParentId}
        parentLocation={selectedLocation}
        initialData={dataState.editingLocation || undefined}
        isEdit={!!dataState.editingLocation}
        isLoading={
          dataState.editingLocation
            ? updateLocationMutation.isPending
            : createLocationMutation.isPending
        }
      />
      <ExportDataModal
        isOpen={uiState.isExportOpen}
        onClose={() => updateUiState({ isExportOpen: false })}
      />
      <MoveLocationModal
        isOpen={uiState.isMoveModalOpen}
        onClose={() => {
          updateUiState({ isMoveModalOpen: false });
          updateDataState({ locationToMove: null });
        }}
        onMove={handleConfirmMove}
        location={dataState.locationToMove}
        isLoading={moveLocationMutation.isPending}
      />
    </div>
  );
};

export default HomePage;
