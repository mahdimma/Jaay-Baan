import React, { useState } from "react";
import Icon from "./Icon";
import Loading from "./Loading";
import type { TreeNode } from "../../types";

interface TreeSelectorProps {
  data: TreeNode[] | undefined;
  isLoading?: boolean;
  selectedValue?: string;
  onSelect: (value: string) => void;
  showRoot?: boolean;
  rootLabel?: string;
  emptyMessage?: string;
  filterContainers?: boolean;
}

export const TreeSelector: React.FC<TreeSelectorProps> = ({
  data,
  isLoading = false,
  selectedValue,
  onSelect,
  showRoot = true,
  rootLabel = "ریشه (بدون والد)",
  emptyMessage = "مکانی برای انتخاب موجود نیست",
  filterContainers = false,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const canSelectNode = (node: TreeNode): boolean => {
    if (filterContainers) {
      return node.is_container;
    }
    return true;
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedValue === node.id.toString();
    const canSelect = canSelectNode(node);

    return (
      <div key={node.id}>
        <div
          className={`tree-item flex items-center py-2 px-3 cursor-pointer rounded-md ${
            isSelected ? "bg-primary-100 border border-primary-300" : ""
          } ${
            !canSelect ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
          style={{ marginRight: `${level * 20}px` }}
          onClick={() => canSelect && onSelect(node.id.toString())}
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
              !canSelect ? "text-gray-400" : ""
            }`}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm font-medium truncate ${
                !canSelect ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {node.name}
            </span>
            {!canSelect && filterContainers && (
              <span className="text-xs text-gray-500 mr-2">(غیر ظرف)</span>
            )}
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <Icon
              name="check-circle"
              size={16}
              className="text-primary-600 mr-2"
            />
          )}
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

  return (
    <div className="border rounded-lg p-3 max-h-64 overflow-y-auto bg-white">
      {/* Root Option */}
      {showRoot && (
        <div
          className={`tree-item flex items-center py-2 px-3 cursor-pointer rounded-md mb-3 ${
            selectedValue === "" || selectedValue === "root"
              ? "bg-primary-100 border border-primary-300"
              : "hover:bg-gray-50"
          }`}
          onClick={() => onSelect("")}
        >
          <Icon name="home" size={16} className="text-primary-600 ml-2" />
          <span className="text-sm font-medium text-gray-900">{rootLabel}</span>
          {(selectedValue === "" || selectedValue === "root") && (
            <Icon
              name="check-circle"
              size={16}
              className="text-primary-600 mr-2"
            />
          )}
        </div>
      )}

      {/* Tree Nodes */}
      {isLoading ? (
        <Loading text="بارگذاری درخت مکان‌ها..." />
      ) : data && data.length > 0 ? (
        <div>{data.map((node) => renderTreeNode(node))}</div>
      ) : (
        <div className="text-center py-4 text-gray-500">{emptyMessage}</div>
      )}
    </div>
  );
};

export default TreeSelector;
