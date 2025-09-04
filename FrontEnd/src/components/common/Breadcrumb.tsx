import React from "react";
import type { BreadcrumbItem } from "../../types";
import { Icon } from "../ui";
import { locationTypeLabels } from "../../lib/utils";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
  onHomeClick?: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onItemClick,
  onHomeClick,
}) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 space-x-reverse">
        <li>
          <button
            onClick={onHomeClick}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Icon name="home" size={16} />
          </button>
        </li>

        {items.map((item, index) => (
          <li key={item.id} className="flex items-center">
            <Icon
              name="chevron-left"
              size={16}
              className="text-gray-400 mx-2"
            />
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.name}</span>
            ) : (
              <button
                onClick={() => onItemClick?.(item)}
                className="text-primary-600 hover:text-primary-800 transition-colors font-medium"
              >
                {item.name}
              </button>
            )}
            <span className="text-xs text-gray-500 mr-1">
              ({locationTypeLabels[item.location_type]})
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
