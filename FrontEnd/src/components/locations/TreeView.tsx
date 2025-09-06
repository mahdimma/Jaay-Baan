import React, { useState } from "react";
import { Icon } from "../ui";
import { locationTypeLabels, locationTypeIcons } from "../../lib/utils";
import type { TreeNode } from "../../types";

interface TreeViewProps {
  data: TreeNode[];
  onNodeSelect?: (node: TreeNode) => void;
  selectedNodeId?: number;
  expandedNodes?: Set<number>;
  onNodeToggle?: (nodeId: number) => void;
}

interface TreeNodeProps {
  node: TreeNode;
  level: number;
  onSelect?: (node: TreeNode) => void;
  selectedNodeId?: number;
  expandedNodes?: Set<number>;
  onToggle?: (nodeId: number) => void;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  level,
  onSelect,
  selectedNodeId,
  expandedNodes,
  onToggle,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const locationTypeIcon =
    locationTypeIcons[node.location_type] || "more-horizontal";
  const isSelected = node.id === selectedNodeId;
  const isExpanded = expandedNodes?.has(node.id) || false;

  return (
    <div>
      <div
        className={`min-w-40 tree-item flex items-center py-2 px-3 cursor-pointer rounded-md ${
          isSelected ? "selected" : ""
        }`}
        style={{ marginRight: `${level * 20}px` }}
        onClick={() => onSelect?.(node)}
      >
        {/* Expand/Collapse Button */}
        <div className="w-5 flex items-center justify-center ml-1">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(node.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Icon
                name={isExpanded ? "chevron-down" : "chevron-right"}
                size={14}
                className="text-gray-400 dark:text-gray-500"
              />
            </button>
          )}
        </div>

        {/* Icon */}
        <Icon
          name={locationTypeIcon as any}
          size={16}
          className="text-primary-600 dark:text-gray-400 ml-2"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {node.name}
            </span>
            <div className="flex items-center space-x-2 space-x-reverse mr-2">
              {node.is_container && node.children_count > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({node.children_count})
                </span>
              )}
              {node.needs_cleaning && (
                <Icon
                  name="alert-circle"
                  size={12}
                  className="text-orange-500 dark:text-orange-400"
                />
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {locationTypeLabels[node.location_type]}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView: React.FC<TreeViewProps> = ({
  data,
  onNodeSelect,
  selectedNodeId,
  expandedNodes = new Set(),
  onNodeToggle,
}) => {
  const [internalExpandedNodes, setInternalExpandedNodes] = useState<
    Set<number>
  >(new Set());

  const currentExpandedNodes =
    expandedNodes.size > 0 ? expandedNodes : internalExpandedNodes;

  const handleToggle = (nodeId: number) => {
    if (onNodeToggle) {
      onNodeToggle(nodeId);
    } else {
      setInternalExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Icon
          name="layers"
          size={48}
          className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
        />
        <p>هیچ مکانی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-auto max-h-96">
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          onSelect={onNodeSelect}
          selectedNodeId={selectedNodeId}
          expandedNodes={currentExpandedNodes}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};

export default TreeView;
