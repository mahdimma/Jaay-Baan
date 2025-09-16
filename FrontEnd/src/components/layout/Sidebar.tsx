import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon, Button } from "../ui";
import { useAuthStore } from "../../store";
import { useLogout } from "../../hooks/useApi";
import ThemeToggle from "../ui/ThemeToggle";

// Add onClose prop to the component props
const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle navigation item click
  const handleNavigationClick = () => {
    // Only close on mobile devices
    if (onClose && window.innerWidth < 1024) {
      // 1024px is tailwind's lg breakpoint
      onClose();
    }
  };

  const navigationItems = [
    { path: "/", label: "خانه", icon: "home" as const },
    { path: "/search", label: "جستجو", icon: "search" as const },
    { path: "/statistics", label: "آمار", icon: "bar-chart" as const },
    { path: "/cleaning", label: "تمیزکاری", icon: "refresh" as const },
  ];

  return (
    <aside className="flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header with logo */}
      <div className="flex items-center px-4 mb-6">
        <Link
          to="/"
          className="flex items-center space-x-2 space-x-reverse"
          onClick={handleNavigationClick}
        >
          <Icon
            name="layers"
            className="text-primary-600 dark:text-white"
            size={32}
          />
          <span className="text-2xl font-bold text-gray-900 dark:text-white mr-1">
            جای بان
          </span>
        </Link>
      </div>

      <div className="flex flex-col justify-between flex-1">
        {/* Navigation */}
        <nav>
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavigationClick} // Add onClick handler
              className={`flex items-center px-4 py-2 mt-5 text-gray-600 dark:text-gray-300 transition-colors duration-300 transform rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white ${
                location.pathname === item.path
                  ? "bg-gray-100 dark:bg-gray-700"
                  : ""
              }`}
            >
              <Icon name={item.icon} size={20} />
              <span className="mx-4 font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info and logout at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          {/* Theme Toggle */}
          <div className="px-4 py-2 mb-3">
            <ThemeToggle />
          </div>

          <div className="flex items-center px-4 py-2 mb-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Icon
                name="user"
                size={14}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mr-3">
              {user?.username}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={logoutMutation.isPending}
            className="w-full justify-start flex-row px-4 py-2 text-red-600 dark:text-red-400 bg-red-200 dark:bg-red-900 hover:bg-red-300 dark:hover:bg-red-800 rounded-lg transition-colors"
            icon={<Icon name="logout" size={16} className="ml-4 mr-2" />}
            text="خروج"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
