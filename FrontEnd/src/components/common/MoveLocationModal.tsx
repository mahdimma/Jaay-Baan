import React, { useState, useEffect } from "react";
import { useLocationTree } from "../../hooks/useApi";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import LazyTreeSelector from "../ui/LazyTreeSelector";
import type { Location } from "../../types";

interface MoveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (newParentId: number | null) => void;
  location: Location | null;
  isLoading?: boolean;
}

export const MoveLocationModal: React.FC<MoveLocationModalProps> = ({
  isOpen,
  onClose,
  onMove,
  location,
  isLoading = false,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  const { data: treeData, isLoading: treeLoading } = useLocationTree("root");

  useEffect(() => {
    if (location) {
      setSelectedParentId(
        location.parent_id ? location.parent_id.toString() : ""
      );
    }
  }, [location]);

  const handleMove = () => {
    const parentId =
      selectedParentId === "" ? null : parseInt(selectedParentId);
    onMove(parentId);
  };

  const handleTreeSelect = (value: string) => {
    setSelectedParentId(value);
  };

  if (!location) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`جابجایی: ${location.name}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Current Location Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            مکان فعلی:
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {location.breadcrumb}
          </p>
        </div>

        {/* Root Option */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            انتخاب مکان مقصد:
          </h3>
        </div>

        {/* Tree View */}
        <LazyTreeSelector
          rootData={treeData}
          isRootLoading={treeLoading}
          selectedValue={selectedParentId}
          onSelect={handleTreeSelect}
          showRoot={true}
          rootLabel="ریشه (بدون والد)"
          emptyMessage="مکانی برای انتخاب موجود نیست"
          filterContainers={true}
          filterCurrentId={location.id}
        />

        {/* Selected Location Preview */}
        {selectedParentId && selectedParentId !== "" && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start">
              <Icon
                name="alert-circle"
                className="text-blue-600 dark:text-blue-400 mt-0.5 ml-3"
                size={16}
              />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">مکان انتخاب شده:</p>
                <p>مکان شماره {selectedParentId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="ml-2"
            text="انصراف"
          />
          <Button
            onClick={handleMove}
            loading={isLoading}
            disabled={
              selectedParentId === (location?.parent_id?.toString() || "")
            }
            text="جابجایی"
          />
        </div>
      </div>
    </Modal>
  );
};

export default MoveLocationModal;
