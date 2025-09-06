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

// Base TreeNode renderer that can be extended
interface BaseTreeNodeProps {
  node: TreeNode;
  level: number;
  expandedNodes: Set<number>;
  onToggle: (nodeId: number) => void;
  renderNodeContent: (node: TreeNode, level: number) => React.ReactNode;
}

const BaseTreeNode: React.FC<BaseTreeNodeProps> = ({
  node,
  level,
  expandedNodes,
  onToggle,
  renderNodeContent,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  return (
    <div>
      {renderNodeContent(node, level)}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <BaseTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              renderNodeContent={renderNodeContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

  const handleNodeToggle = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeSelect = (node: TreeNode) => {
    // Check if node can be selected based on filter
    if (filterContainers && !node.is_container) {
      return; // Don't select non-container nodes if filtering for containers
    }
    onSelect(node.id.toString());
  };

  const selectedNodeId = selectedValue ? parseInt(selectedValue) : undefined;

  const canSelectNode = (node: TreeNode): boolean => {
    if (filterContainers) {
      return node.is_container;
    }
    return true;
  };

  // Custom renderer for selectable tree nodes
  const renderSelectableNode = (node: TreeNode, level: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const canSelect = canSelectNode(node);

    return (
      <div
        className={`tree-item flex items-center py-2 px-3 cursor-pointer rounded-md transition-colors ${
          isSelected
            ? "bg-blue-100 dark:bg-blue-800/50 border border-blue-300 dark:border-blue-500"
            : ""
        } ${
          !canSelect
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50 dark:hover:bg-slate-700"
        }`}
        style={{ marginRight: `${level * 20}px` }}
        onClick={() => canSelect && handleNodeSelect(node)}
      >
        {/* Expand/Collapse Button */}
        <div className="w-5 flex items-center justify-center ml-1">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNodeToggle(node.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
            >
              <Icon
                name={isExpanded ? "chevron-down" : "chevron-right"}
                size={14}
                className="text-gray-400 dark:text-slate-500"
              />
            </button>
          )}
        </div>

        {/* Icon */}
        <Icon
          name={node.is_container ? "package" : "tag"}
          size={16}
          className={`ml-2 ${
            !canSelect
              ? "text-gray-400 dark:text-slate-500"
              : isSelected
              ? "text-blue-600 dark:text-blue-300"
              : "text-primary-600 dark:text-primary-400"
          }`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className={`text-sm font-medium truncate ${
              !canSelect
                ? "text-gray-400 dark:text-slate-500"
                : isSelected
                ? "text-blue-800 dark:text-blue-200"
                : "text-gray-900 dark:text-slate-100"
            }`}
          >
            {node.name}
          </span>
          {!canSelect && filterContainers && (
            <span className="text-xs text-gray-500 dark:text-slate-400 mr-2">
              (غیر ظرف)
            </span>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <Icon
            name="check-circle"
            size={16}
            className="text-blue-600 dark:text-blue-300 mr-2"
          />
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-3 max-h-64 overflow-y-auto bg-white dark:bg-slate-800">
      {/* Root Option */}
      {showRoot && (
        <div
          className={`tree-item flex items-center py-2 px-3 cursor-pointer rounded-md mb-3 transition-colors ${
            selectedValue === "" || selectedValue === "root"
              ? "bg-blue-100 dark:bg-blue-800/50 border border-blue-300 dark:border-blue-500"
              : "hover:bg-gray-50 dark:hover:bg-slate-700"
          }`}
          onClick={() => onSelect("")}
        >
          <Icon
            name="home"
            size={16}
            className={`${
              selectedValue === "" || selectedValue === "root"
                ? "text-blue-600 dark:text-blue-300"
                : "text-primary-600 dark:text-primary-400"
            } ml-2`}
          />
          <span
            className={`text-sm font-medium ${
              selectedValue === "" || selectedValue === "root"
                ? "text-blue-800 dark:text-blue-200"
                : "text-gray-900 dark:text-slate-100"
            }`}
          >
            {rootLabel}
          </span>
          {(selectedValue === "" || selectedValue === "root") && (
            <Icon
              name="check-circle"
              size={16}
              className="text-blue-600 dark:text-blue-300 mr-2"
            />
          )}
        </div>
      )}

      {/* Tree Content */}
      {isLoading ? (
        <Loading text="بارگذاری درخت مکان‌ها..." />
      ) : data && data.length > 0 ? (
        <div className="space-y-1">
          {data.map((node) => (
            <BaseTreeNode
              key={node.id}
              node={node}
              level={0}
              expandedNodes={expandedNodes}
              onToggle={handleNodeToggle}
              renderNodeContent={renderSelectableNode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-slate-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default TreeSelector;
