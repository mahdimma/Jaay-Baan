import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import Icon from "./Icon";

interface ViewToggleProps {
  view: "tree" | "grid";
  updateUiState: (state: { view: "tree" | "grid" }) => void;
}

const ViewToggle = ({ view, updateUiState }: ViewToggleProps) => {
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const views = [
    { id: "tree", label: "فهرست", icon: "list" as const },
    { id: "grid", label: "شبکه", icon: "grid" as const },
  ];

  const activeIndex = view === "tree" ? 0 : 1;

  useEffect(() => {
    const updateIndicator = () => {
      if (containerRef.current) {
        const buttons = containerRef.current.querySelectorAll("button");
        if (buttons[activeIndex]) {
          const activeButton = buttons[activeIndex] as HTMLButtonElement;
          setIndicatorPosition(activeButton.offsetLeft);
          setIndicatorWidth(activeButton.offsetWidth);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateIndicator, 10);
    updateIndicator();

    return () => clearTimeout(timer);
  }, [activeIndex]);

  const handleViewChange = (selectedView: "tree" | "grid") => {
    updateUiState({ view: selectedView });
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="inline-flex bg-gray-50 p-1 rounded-xl shadow-md">
        {views.map((viewItem) => {
          const isActive = view === viewItem.id;
          return (
            <button
              key={viewItem.id}
              onClick={() => handleViewChange(viewItem.id as "tree" | "grid")}
              className={cn(
                "relative z-20 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer min-w-[90px] gap-2",
                "hover:scale-[1.02] active:scale-[0.98]",
                "focus:outline-none",
                isActive ? "text-white" : "text-gray-700 hover:text-gray-900"
              )}
            >
              <Icon name={viewItem.icon} size={16} />
              <span className="font-medium">{viewItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated sliding indicator matching Button primary variant */}
      <div
        className="absolute top-1 h-[calc(100%-8px)] bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg transition-all duration-300 ease-out z-10"
        style={{
          left: `${indicatorPosition}px`,
          width: `${indicatorWidth}px`,
          transform: "translateZ(0)", // Hardware acceleration
        }}
      />
    </div>
  );
};

export default ViewToggle;
