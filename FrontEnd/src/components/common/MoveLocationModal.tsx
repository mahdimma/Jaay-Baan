import React, { useState, useEffect } from "react";
import { useLocationTree } from "../../hooks/useApi";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Loading from "../ui/Loading";
import type { TreeNode, Location } from "../../types";

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
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const { data: treeData, isLoading: treeLoading } = useLocationTree();

  useEffect(() => {
    if (location) {
      setSelectedParentId(location.parent_id || null);
    }
  }, [location]);

  const handleMove = () => {
    onMove(selectedParentId);
  };

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const canMoveToNode = (node: TreeNode): boolean => {
    if (!location) return false;

    // Can't move to itself
    if (node.id === location.id) return false;

    // Can't move to non-container
    if (!node.is_container) return false;

    // Can't move to its own descendants (simplified check)
    // In a real app, you'd implement a proper descendant check
    return true;
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedParentId === node.id;
    const canMove = canMoveToNode(node);

    return (
      <div key={node.id}>
        <div
          className={`tree-item flex items-center py-2 px-3 cursor-pointer rounded-md ${
            isSelected ? "bg-primary-100 border-primary-500" : ""
          } ${!canMove ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
          style={{ marginRight: `${level * 20}px` }}
          onClick={() => canMove && setSelectedParentId(node.id)}
        >
          {/* Expand/Collapse Button */}
          <div className="w-5 flex items-center justify-center ml-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                <Icon
                  name={isExpanded ? "chevron-down" : "chevron-right"}
                  size={14}
                  className="text-gray-400"
                />
              </button>
            )}
          </div>

          {/* Icon */}
          <Icon
            name={node.is_container ? "package" : "tag"}
            size={16}
            className={`text-primary-600 ml-2 ${
              !canMove ? "text-gray-400" : ""
            }`}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm font-medium truncate ${
                !canMove ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {node.name}
            </span>
            {!canMove && node.id === location?.id && (
              <span className="text-xs text-red-500 mr-2">(همین مکان)</span>
            )}
            {!canMove && !node.is_container && (
              <span className="text-xs text-gray-500 mr-2">(غیر ظرف)</span>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children?.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
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
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">مکان فعلی:</h3>
          <p className="text-sm text-gray-600">{location.breadcrumb}</p>
        </div>

        {/* Root Option */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">انتخاب مکان مقصد:</h3>

          <div
            className={`tree-item flex items-center py-2 px-3 cursor-pointer rounded-md mb-3 ${
              selectedParentId === null
                ? "bg-primary-100 border-primary-500"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedParentId(null)}
          >
            <Icon name="home" size={16} className="text-primary-600 ml-2" />
            <span className="text-sm font-medium text-gray-900">
              ریشه (بدون والد)
            </span>
          </div>
        </div>

        {/* Tree View */}
        <div className="border rounded-lg p-3 max-h-64 overflow-y-auto">
          {treeLoading ? (
            <Loading text="بارگذاری درخت مکان‌ها..." />
          ) : treeData && treeData.length > 0 ? (
            <div>{treeData.map((node) => renderTreeNode(node))}</div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              مکانی برای انتخاب موجود نیست
            </div>
          )}
        </div>

        {/* Selected Location Preview */}
        {selectedParentId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Icon
                name="alert-circle"
                className="text-blue-600 mt-0.5 ml-3"
                size={16}
              />
              <div className="text-sm text-blue-800">
                <p className="font-medium">مکان انتخاب شده:</p>
                <p>
                  {treeData &&
                    (() => {
                      const findNode = (nodes: TreeNode[]): TreeNode | null => {
                        for (const node of nodes) {
                          if (node.id === selectedParentId) return node;
                          if (node.children) {
                            const found = findNode(node.children);
                            if (found) return found;
                          }
                        }
                        return null;
                      };
                      const selectedNode = findNode(treeData);
                      return selectedNode ? selectedNode.breadcrumb : "نامشخص";
                    })()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            انصراف
          </Button>
          <Button
            onClick={handleMove}
            loading={isLoading}
            disabled={selectedParentId === (location.parent_id || null)}
          >
            جابجایی
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MoveLocationModal;
