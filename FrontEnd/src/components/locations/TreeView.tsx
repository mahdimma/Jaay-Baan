import React, { useState, useCallback } from "react";
import { Icon } from "../ui";
import { LoadingSpinner } from "../ui/Loading";
import { locationTypeLabels, locationTypeIcons } from "../../lib/utils";
import { useLazyTreeNode } from "../../hooks/useApi";
import type { TreeNode } from "../../types";

interface LazyTreeNode extends TreeNode {
  children?: LazyTreeNode[];
  isLoading?: boolean;
  isExpanded?: boolean;
  hasLoadedChildren?: boolean;
}

interface TreeViewProps {
  data: LazyTreeNode[];
  onNodeSelect?: (node: LazyTreeNode) => void;
  selectedNodeId?: number;
  onDataUpdate?: (data: LazyTreeNode[]) => void;
}

interface TreeNodeProps {
  node: LazyTreeNode;
  level: number;
  onSelect?: (node: LazyTreeNode) => void;
  selectedNodeId?: number;
  onNodeUpdate?: (nodeId: number, updates: Partial<LazyTreeNode>) => void;
  onLoadChildren?: (nodeId: number) => Promise<void>;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  level,
  onSelect,
  selectedNodeId,
  onNodeUpdate,
  onLoadChildren,
}) => {
  const hasChildren = node.is_container && node.children_count > 0;
  const locationTypeIcon =
    locationTypeIcons[node.location_type] || "more-horizontal";
  const isSelected = node.id === selectedNodeId;
  const isExpanded = node.isExpanded || false;
  const isLoading = node.isLoading || false;

  const handleToggle = async () => {
    if (!hasChildren) return;

    if (!isExpanded) {
      // Expanding - load children if not loaded yet
      if (!node.hasLoadedChildren) {
        onNodeUpdate?.(node.id, { isLoading: true });
        try {
          await onLoadChildren?.(node.id);
        } catch (error) {
          console.error("Failed to load children:", error);
          onNodeUpdate?.(node.id, { isLoading: false });
          return;
        }
      }
      onNodeUpdate?.(node.id, { isExpanded: true, isLoading: false });
    } else {
      // Collapsing
      onNodeUpdate?.(node.id, { isExpanded: false });
    }
  };

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
                handleToggle();
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Icon
                  name={isExpanded ? "chevron-down" : "chevron-right"}
                  size={14}
                  className="text-gray-400 dark:text-gray-500"
                />
              )}
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
      {hasChildren && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
              onNodeUpdate={onNodeUpdate}
              onLoadChildren={onLoadChildren}
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
  onDataUpdate,
}) => {
  const [treeData, setTreeData] = useState<LazyTreeNode[]>(data);
  const lazyTreeNode = useLazyTreeNode();

  // Update local state when data prop changes
  React.useEffect(() => {
    setTreeData(data);
  }, [data]);

  // Update a specific node in the tree
  const updateNodeInTree = useCallback(
    (
      nodes: LazyTreeNode[],
      nodeId: number,
      updates: Partial<LazyTreeNode>
    ): LazyTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, ...updates };
        }
        if (node.children) {
          return {
            ...node,
            children: updateNodeInTree(node.children, nodeId, updates),
          };
        }
        return node;
      });
    },
    []
  );

  // Handle node updates
  const handleNodeUpdate = useCallback(
    (nodeId: number, updates: Partial<LazyTreeNode>) => {
      setTreeData((prevData) => {
        const newData = updateNodeInTree(prevData, nodeId, updates);
        onDataUpdate?.(newData);
        return newData;
      });
    },
    [updateNodeInTree, onDataUpdate]
  );

  // Load children for a specific node
  const loadChildren = useCallback(
    async (nodeId: number) => {
      try {
        console.log("Loading children for nodeId:", nodeId);
        // Load children for this specific parent
        const children = await lazyTreeNode.mutateAsync(nodeId);
        console.log("Loaded children:", children);

        const childrenWithState: LazyTreeNode[] = children.map(
          (child: TreeNode) => ({
            ...child,
            isExpanded: false,
            hasLoadedChildren: false,
            isLoading: false,
          })
        );

        setTreeData((prevData) => {
          const newData = updateNodeInTree(prevData, nodeId, {
            children: childrenWithState,
            hasLoadedChildren: true,
            isLoading: false,
          });
          onDataUpdate?.(newData);
          return newData;
        });
      } catch (error) {
        console.error("Failed to load children:", error);
        throw error;
      }
    },
    [updateNodeInTree, onDataUpdate, lazyTreeNode]
  );

  if (!treeData || treeData.length === 0) {
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
      {treeData.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          onSelect={onNodeSelect}
          selectedNodeId={selectedNodeId}
          onNodeUpdate={handleNodeUpdate}
          onLoadChildren={loadChildren}
        />
      ))}
    </div>
  );
};

export default TreeView;
