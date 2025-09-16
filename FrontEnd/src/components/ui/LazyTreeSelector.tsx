import React, { useState, useCallback } from "react";
import { Icon } from "../ui";
import { LoadingSpinner } from "../ui/Loading";
import { locationTypeLabels, locationTypeIcons } from "../../lib/utils";
import { useLazyTreeNode } from "../../hooks/useApi";
import type { TreeNode } from "../../types";
import type { IconName } from "../../types/icon";

interface LazyTreeNode extends TreeNode {
  children?: LazyTreeNode[];
  isLoading?: boolean;
  isExpanded?: boolean;
  hasLoadedChildren?: boolean;
}

interface LazyTreeSelectorProps {
  rootData: TreeNode[] | undefined;
  isRootLoading?: boolean;
  selectedValue?: string;
  onSelect: (value: string) => void;
  showRoot?: boolean;
  rootLabel?: string;
  emptyMessage?: string;
  filterContainers?: boolean;
  filterCurrentId?: number; // New prop
}

interface LazyTreeNodeProps {
  node: LazyTreeNode;
  level: number;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onNodeUpdate?: (nodeId: number, updates: Partial<LazyTreeNode>) => void;
  onLoadChildren?: (nodeId: number) => Promise<void>;
  filterContainers?: boolean;
  filterCurrentId?: number; // New prop
}

const LazyTreeNodeComponent: React.FC<LazyTreeNodeProps> = ({
  node,
  level,
  selectedValue,
  onSelect,
  onNodeUpdate,
  onLoadChildren,
  filterContainers = false,
  filterCurrentId: filterCurrentId, // New prop
}) => {
  const hasChildren = node.is_container && node.children_count > 0;
  const locationTypeIcon =
    locationTypeIcons[node.location_type] || "more-horizontal";
  const isSelected = node.id.toString() === selectedValue;
  const isExpanded = node.isExpanded || false;
  const isLoading = node.isLoading || false;

  // New function to check if node should be filtered
  const isNodeFiltered = (nodeId: number): boolean => {
    return filterCurrentId !== undefined && nodeId === filterCurrentId;
  };

  const canSelectNode = (node: TreeNode): boolean => {
    // Check if this node or any parent is filtered
    if (isNodeFiltered(node.id)) {
      return false;
    }

    if (filterContainers) {
      return node.is_container;
    }
    return true;
  };

  const canSelect = canSelectNode(node);
  // New: Check if node is expandable
  const isExpandable = hasChildren && !isNodeFiltered(node.id);

  const handleToggle = async () => {
    // New: Prevent expanding filtered nodes
    if (!isExpandable) return;

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

  const handleNodeSelect = () => {
    if (canSelect) {
      onSelect(node.id.toString());
    }
  };

  return (
    <div>
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
        onClick={handleNodeSelect}
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
              disabled={isLoading || !isExpandable} // New: Disable if not expandable
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
          name={locationTypeIcon as IconName}
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
          <div className="flex items-center justify-between">
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
            {!canSelect &&
              filterContainers &&
              !node.is_container &&
              " (غیر ظرف)"}
            {!canSelect && isNodeFiltered(node.id) && " (خودش و محتویات)"}
          </div>
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

      {/* Children */}
      {hasChildren && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <LazyTreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedValue={selectedValue}
              onSelect={onSelect}
              onNodeUpdate={onNodeUpdate}
              onLoadChildren={onLoadChildren}
              filterContainers={filterContainers}
              filterCurrentId={filterCurrentId} // Pass down
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LazyTreeSelector: React.FC<LazyTreeSelectorProps> = ({
  rootData,
  isRootLoading = false,
  selectedValue,
  onSelect,
  showRoot = true,
  rootLabel = "ریشه (بدون والد)",
  emptyMessage = "مکانی برای انتخاب موجود نیست",
  filterContainers = false,
  filterCurrentId, // New prop
}) => {
  const [treeData, setTreeData] = useState<LazyTreeNode[]>([]);
  const lazyTreeNode = useLazyTreeNode();

  // Initialize local tree state when rootData changes
  React.useEffect(() => {
    if (rootData) {
      const nodesWithState: LazyTreeNode[] = rootData.map((node) => ({
        ...node,
        isExpanded: false,
        hasLoadedChildren: false,
        isLoading: false,
      }));
      setTreeData(nodesWithState);
    } else {
      setTreeData([]);
    }
  }, [rootData]);

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
      setTreeData((prevData) => updateNodeInTree(prevData, nodeId, updates));
    },
    [updateNodeInTree]
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

        setTreeData((prevData) =>
          updateNodeInTree(prevData, nodeId, {
            children: childrenWithState,
            hasLoadedChildren: true,
            isLoading: false,
          })
        );
      } catch (error) {
        console.error("Failed to load children:", error);
        throw error;
      }
    },
    [updateNodeInTree, lazyTreeNode]
  );

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
      {isRootLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner size="sm" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            بارگذاری درخت مکان‌ها...
          </p>
        </div>
      ) : treeData && treeData.length > 0 ? (
        <div className="space-y-1">
          {treeData.map((node) => (
            <LazyTreeNodeComponent
              key={node.id}
              node={node}
              level={0}
              selectedValue={selectedValue}
              onSelect={onSelect}
              onNodeUpdate={handleNodeUpdate}
              onLoadChildren={loadChildren}
              filterContainers={filterContainers}
              filterCurrentId={filterCurrentId} // Pass down
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-slate-400">
          <Icon
            name="layers"
            size={24}
            className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
          />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LazyTreeSelector;
