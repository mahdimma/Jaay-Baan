import React, { useState } from "react";
import { Button, Icon, Modal, Select } from "../ui";
import { useBulkOperations, useLocations } from "../../hooks/useApi";
import { locationTypeLabels } from "../../lib/utils";
import toast from "react-hot-toast";
import type { Location } from "../../types";

interface BulkActionsProps {
  selectedItems: number[];
  onClearSelection: () => void;
  allItems?: Location[];
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  onClearSelection,
  allItems = [],
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<
    number | undefined
  >();

  const bulkOperationMutation = useBulkOperations();
  const { data: locationsData } = useLocations({
    page_size: 1000, // Get more options for move operation
  });

  const selectedCount = selectedItems.length;

  const handleBulkMarkCleaned = () => {
    bulkOperationMutation.mutate(
      {
        operation: "mark_cleaned",
        location_ids: selectedItems,
      },
      {
        onSuccess: () => {
          toast.success(`${selectedCount} مکان به عنوان تمیز علامت‌گذاری شدند`);
          onClearSelection();
        },
        onError: () => {
          toast.error("خطا در علامت‌گذاری تمیزکاری");
        },
      }
    );
  };

  const handleBulkDelete = () => {
    // Check if any selected items have children
    const itemsWithChildren = allItems.filter(
      (item) => selectedItems.includes(item.id) && item.children_count > 0
    );

    if (itemsWithChildren.length > 0) {
      toast.error("نمی‌توان مکان‌هایی که دارای فرزند هستند را حذف کرد");
      return;
    }

    bulkOperationMutation.mutate(
      {
        operation: "delete",
        location_ids: selectedItems,
      },
      {
        onSuccess: () => {
          toast.success(`${selectedCount} مکان حذف شدند`);
          onClearSelection();
          setIsDeleteModalOpen(false);
        },
        onError: () => {
          toast.error("خطا در حذف مکان‌ها");
        },
      }
    );
  };

  const handleBulkMove = () => {
    if (!selectedParentId) {
      toast.error("لطفاً مکان مقصد را انتخاب کنید");
      return;
    }

    bulkOperationMutation.mutate(
      {
        operation: "move_to_parent",
        location_ids: selectedItems,
        new_parent_id: selectedParentId,
      },
      {
        onSuccess: () => {
          toast.success(`${selectedCount} مکان جابجا شدند`);
          onClearSelection();
          setIsMoveModalOpen(false);
          setSelectedParentId(undefined);
        },
        onError: () => {
          toast.error("خطا در جابجایی مکان‌ها");
        },
      }
    );
  };

  const containerLocations =
    locationsData?.results?.filter(
      (loc) => loc.is_container && !selectedItems.includes(loc.id)
    ) || [];

  const moveOptions = [
    { value: "", label: "انتقال به ریشه" },
    ...containerLocations.map((loc) => ({
      value: loc.id.toString(),
      label: `${loc.name} (${locationTypeLabels[loc.location_type]})`,
    })),
  ];

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Icon name="check-circle" className="text-primary-600" size={20} />
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} مورد انتخاب شده
            </span>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkMarkCleaned}
              loading={bulkOperationMutation.isPending}
              icon={<Icon name="check-circle" size={16} className="ml-1" />}
              text="تمیز شده"
            />

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMoveModalOpen(true)}
              loading={bulkOperationMutation.isPending}
              icon={<Icon name="move" size={16} className="ml-1" />}
              text="جابجایی"
            />

            <Button
              size="sm"
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
              loading={bulkOperationMutation.isPending}
              icon={<Icon name="trash" size={16} className="ml-1" />}
              text="حذف"
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              icon={<Icon name="x" size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأیید حذف"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Icon name="alert-circle" className="text-red-600 mt-1" size={20} />
            <div>
              <p className="text-gray-900">
                آیا از حذف {selectedCount} مکان انتخاب شده اطمینان دارید؟
              </p>
              <p className="text-sm text-gray-500 mt-1">
                این عمل غیرقابل بازگشت است.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              text="انصراف"
            />
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              loading={bulkOperationMutation.isPending}
              text="حذف"
            />
          </div>
        </div>
      </Modal>

      {/* Move Modal */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="جابجایی مکان‌ها"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-900">
            جابجایی {selectedCount} مکان انتخاب شده به:
          </p>

          <Select
            label="مکان مقصد"
            value={selectedParentId?.toString() || ""}
            onChange={(e) =>
              setSelectedParentId(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            options={moveOptions}
            placeholder="مکان مقصد را انتخاب کنید"
          />

          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setIsMoveModalOpen(false)}
              text="انصراف"
            />
            <Button
              onClick={handleBulkMove}
              loading={bulkOperationMutation.isPending}
              disabled={!selectedParentId && selectedParentId !== 0}
              text="جابجایی"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BulkActions;
